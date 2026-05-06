import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { clearCache } from '../../middleware/cache';
import { CreateJobInput, JobQueryInput } from './jobs.validation';

export const jobsService = {
  async getAll(query: JobQueryInput) {
    const { search, category, type, experienceLevel, location, minSalary, maxSalary, isRemote, sort, page, limit } = query;
    const where: any = { status: 'ACTIVE' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (category) where.category = { slug: category };
    if (type) where.type = type;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (isRemote === 'true') where.isRemote = true;
    if (minSalary) where.salaryMin = { gte: parseInt(minSalary) };
    if (maxSalary) where.salaryMax = { lte: parseInt(maxSalary) };

    const orderBy: any = {};
    switch (sort) {
      case 'newest': orderBy.createdAt = 'desc'; break;
      case 'oldest': orderBy.createdAt = 'asc'; break;
      case 'salary_high': orderBy.salaryMax = 'desc'; break;
      case 'salary_low': orderBy.salaryMin = 'asc'; break;
      case 'popular': orderBy.views = 'desc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where, orderBy, skip: (pageNum - 1) * limitNum, take: limitNum,
        include: {
          company: { select: { id: true, name: true, slug: true, logo: true, location: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return { jobs, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
  },

  async getFeatured() {
    return prisma.job.findMany({
      where: { status: 'ACTIVE', featured: true }, take: 8, orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { id: true, name: true, slug: true, logo: true, location: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  },

  async getBySlug(slug: string) {
    const job = await prisma.job.findUnique({
      where: { slug },
      include: {
        company: true,
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { applications: true, savedBy: true } },
      },
    });
    if (!job) throw { status: 404, message: 'Job not found' };

    await prisma.job.update({ where: { id: job.id }, data: { views: { increment: 1 } } });

    const relatedJobs = await prisma.job.findMany({
      where: { status: 'ACTIVE', id: { not: job.id }, OR: [{ categoryId: job.categoryId }, { companyId: job.companyId }] },
      take: 4,
      include: { company: { select: { id: true, name: true, slug: true, logo: true } } },
    });

    return { job, relatedJobs };
  },

  async create(data: CreateJobInput, userId: string) {
    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) throw { status: 400, message: 'You must create a company profile first' };

    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    const job = await prisma.job.create({
      data: { ...data, slug, companyId: company.id, deadline: data.deadline ? new Date(data.deadline) : undefined },
      include: { company: { select: { id: true, name: true, slug: true, logo: true } }, category: { select: { id: true, name: true, slug: true } } },
    });

    clearCache('jobs');
    logger.info(`Job created: ${job.title}`);
    return job;
  },

  async update(jobId: string, data: any, userId: string, userRole: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { company: true } });
    if (!job) throw { status: 404, message: 'Job not found' };
    if (userRole !== 'ADMIN' && job.company.ownerId !== userId) throw { status: 403, message: 'Not authorized' };

    const updated = await prisma.job.update({
      where: { id: jobId }, data,
      include: { company: { select: { id: true, name: true, slug: true, logo: true } }, category: { select: { id: true, name: true, slug: true } } },
    });
    clearCache('jobs');
    return updated;
  },

  async delete(jobId: string, userId: string, userRole: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { company: true } });
    if (!job) throw { status: 404, message: 'Job not found' };
    if (userRole !== 'ADMIN' && job.company.ownerId !== userId) throw { status: 403, message: 'Not authorized' };

    await prisma.job.delete({ where: { id: jobId } });
    clearCache('jobs');
  },

  async toggleSave(jobId: string, userId: string) {
    const existing = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (existing) {
      await prisma.savedJob.delete({ where: { id: existing.id } });
      return { saved: false };
    }
    await prisma.savedJob.create({ data: { userId, jobId } });
    return { saved: true };
  },

  async getSaved(userId: string) {
    return prisma.savedJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true, slug: true, logo: true } },
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  },
};
