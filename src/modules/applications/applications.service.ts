import prisma from '../../lib/prisma';
import logger from '../../lib/logger';

export const applicationsService = {
  async apply(userId: string, userName: string, data: { jobId: string; coverLetter?: string; resume?: string }) {
    const job = await prisma.job.findUnique({ where: { id: data.jobId }, include: { company: true } });
    if (!job || job.status !== 'ACTIVE') throw { status: 404, message: 'Job not found or no longer active' };

    const existing = await prisma.application.findUnique({ where: { userId_jobId: { userId, jobId: data.jobId } } });
    if (existing) throw { status: 400, message: 'You have already applied to this job' };

    const application = await prisma.application.create({
      data: { userId, jobId: data.jobId, coverLetter: data.coverLetter, resume: data.resume },
      include: { job: { include: { company: { select: { name: true, ownerId: true } } } } },
    });

    if (application.job.company.ownerId) {
      await prisma.notification.create({
        data: { userId: application.job.company.ownerId, title: 'New Application', message: `${userName} applied for ${job.title}`, type: 'application', link: '/dashboard/applications' },
      });
    }

    logger.info(`Application: ${userName} -> ${job.title}`);
    return application;
  },

  async getMy(userId: string, query: { status?: string; page?: string; limit?: string }) {
    const where: any = { userId };
    if (query.status) where.status = query.status;
    const pageNum = parseInt(query.page || '1');
    const limitNum = parseInt(query.limit || '10');

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where, skip: (pageNum - 1) * limitNum, take: limitNum, orderBy: { createdAt: 'desc' },
        include: { job: { include: { company: { select: { id: true, name: true, slug: true, logo: true } } } } },
      }),
      prisma.application.count({ where }),
    ]);
    return { applications, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
  },

  async getForEmployer(userId: string, query: { status?: string; jobId?: string; page?: string; limit?: string }) {
    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return { applications: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };

    const where: any = { job: { companyId: company.id } };
    if (query.status) where.status = query.status;
    if (query.jobId) where.jobId = query.jobId;
    const pageNum = parseInt(query.page || '1');
    const limitNum = parseInt(query.limit || '10');

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where, skip: (pageNum - 1) * limitNum, take: limitNum, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, image: true, skills: true, location: true, resume: true } },
          job: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.application.count({ where }),
    ]);
    return { applications, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
  },

  async updateStatus(appId: string, userId: string, userRole: string, status: string, notes?: string) {
    const application = await prisma.application.findUnique({
      where: { id: appId }, include: { job: { include: { company: true } } },
    });
    if (!application) throw { status: 404, message: 'Application not found' };
    if (userRole !== 'ADMIN' && application.job.company.ownerId !== userId) throw { status: 403, message: 'Not authorized' };

    const updated = await prisma.application.update({ where: { id: appId }, data: { status: status as any, notes } });

    await prisma.notification.create({
      data: { userId: application.userId, title: 'Application Update', message: `Your application for ${application.job.title} has been ${status.toLowerCase()}`, type: 'application_update', link: '/dashboard/applications' },
    });

    return updated;
  },
};
