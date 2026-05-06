import prisma from '../../lib/prisma';
import logger from '../../lib/logger';

export const adminService = {
  async getUsers(query: { search?: string; role?: string; page?: string; limit?: string }) {
    const where: any = {};
    if (query.search) { where.OR = [{ name: { contains: query.search, mode: 'insensitive' } }, { email: { contains: query.search, mode: 'insensitive' } }]; }
    if (query.role) where.role = query.role;
    const pageNum = parseInt(query.page || '1');
    const limitNum = parseInt(query.limit || '10');

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip: (pageNum - 1) * limitNum, take: limitNum, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, image: true, createdAt: true, emailVerified: true } }),
      prisma.user.count({ where }),
    ]);
    return { users, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
  },

  async updateUserRole(userId: string, role: string) {
    return prisma.user.update({ where: { id: userId }, data: { role: role as any }, select: { id: true, name: true, email: true, role: true } });
  },

  async deleteUser(userId: string, adminId: string) {
    if (userId === adminId) throw { status: 400, message: 'Cannot delete yourself' };
    await prisma.user.delete({ where: { id: userId } });
  },

  async getStats() {
    const [totalUsers, totalJobs, totalApplications, totalCompanies, activeJobs, recentUsers, recentApplications] = await Promise.all([
      prisma.user.count(), prisma.job.count(), prisma.application.count(), prisma.company.count(),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.application.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    ]);

    const roleDistribution = await prisma.user.groupBy({ by: ['role'], _count: true });
    const appStatusDist = await prisma.application.groupBy({ by: ['status'], _count: true });
    const jobTypeDist = await prisma.job.groupBy({ by: ['type'], _count: true });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyChartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const [users, jobs, apps] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
        prisma.job.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
        prisma.application.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
      ]);
      monthlyChartData.push({ month: months[d.getMonth()], users, jobs, applications: apps });
    }

    return {
      totalUsers, totalJobs, totalApplications, totalCompanies, activeJobs, recentUsers, recentApplications,
      roleDistribution: roleDistribution.map(r => ({ role: r.role, count: r._count })),
      appStatusDist: appStatusDist.map(a => ({ status: a.status, count: a._count })),
      jobTypeDist: jobTypeDist.map(j => ({ type: j.type, count: j._count })),
      monthlyChartData,
    };
  },

  async getJobs(query: { search?: string; status?: string; page?: string; limit?: string }) {
    const where: any = {};
    if (query.search) where.title = { contains: query.search, mode: 'insensitive' };
    if (query.status) where.status = query.status;
    const pageNum = parseInt(query.page || '1');
    const limitNum = parseInt(query.limit || '10');

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({ where, skip: (pageNum - 1) * limitNum, take: limitNum, orderBy: { createdAt: 'desc' }, include: { company: { select: { name: true, slug: true } }, category: { select: { name: true } }, _count: { select: { applications: true } } } }),
      prisma.job.count({ where }),
    ]);
    return { jobs, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
  },

  async getContacts(query: { status?: string; page?: string; limit?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    const pageNum = parseInt(query.page || '1');
    const limitNum = parseInt(query.limit || '10');

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({ where, skip: (pageNum - 1) * limitNum, take: limitNum, orderBy: { createdAt: 'desc' } }),
      prisma.contact.count({ where }),
    ]);
    return { contacts, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
  },

  async updateContactStatus(id: string, status: string) {
    return prisma.contact.update({ where: { id }, data: { status } });
  },

  async getEmployerStats(userId: string) {
    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return { totalJobs: 0, totalApplications: 0, activeJobs: 0, recentApps: 0, appStatusDist: [], monthlyData: [] };

    const [totalJobs, activeJobs, totalApplications, recentApps] = await Promise.all([
      prisma.job.count({ where: { companyId: company.id } }),
      prisma.job.count({ where: { companyId: company.id, status: 'ACTIVE' } }),
      prisma.application.count({ where: { job: { companyId: company.id } } }),
      prisma.application.count({ where: { job: { companyId: company.id }, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);

    const appStatusDist = await prisma.application.groupBy({ by: ['status'], where: { job: { companyId: company.id } }, _count: true });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const s = new Date(d.getFullYear(), d.getMonth(), 1);
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const apps = await prisma.application.count({ where: { job: { companyId: company.id }, createdAt: { gte: s, lte: e } } });
      monthlyData.push({ month: months[d.getMonth()], applications: apps });
    }
    return { totalJobs, activeJobs, totalApplications, recentApps, appStatusDist: appStatusDist.map(a => ({ status: a.status, count: a._count })), monthlyData };
  },

  async getSeekerStats(userId: string) {
    const [totalApplications, savedJobs, pendingApps, interviewApps] = await Promise.all([
      prisma.application.count({ where: { userId } }),
      prisma.savedJob.count({ where: { userId } }),
      prisma.application.count({ where: { userId, status: 'PENDING' } }),
      prisma.application.count({ where: { userId, status: 'INTERVIEW' } }),
    ]);
    const appStatusDist = await prisma.application.groupBy({ by: ['status'], where: { userId }, _count: true });
    return { totalApplications, savedJobs, pendingApps, interviewApps, appStatusDist: appStatusDist.map(a => ({ status: a.status, count: a._count })) };
  },
};
