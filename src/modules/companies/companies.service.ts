import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { clearCache } from '../../middleware/cache';

export const companiesService = {
  async getAll(query: { search?: string; industry?: string; page?: string; limit?: string }) {
    const where: any = {};
    if (query.search) { where.OR = [{ name: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }]; }
    if (query.industry) where.industry = query.industry;
    const pageNum = parseInt(query.page || '1');
    const limitNum = parseInt(query.limit || '12');

    const [companies, total] = await Promise.all([
      prisma.company.findMany({ where, skip: (pageNum - 1) * limitNum, take: limitNum, orderBy: { createdAt: 'desc' }, include: { _count: { select: { jobs: true, reviews: true } } } }),
      prisma.company.count({ where }),
    ]);
    return { companies, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
  },

  async getBySlug(slug: string) {
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        _count: { select: { jobs: true, reviews: true } },
        jobs: { where: { status: 'ACTIVE' }, take: 6, orderBy: { createdAt: 'desc' }, include: { category: { select: { name: true } } } },
        reviews: { take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, image: true } } } },
      },
    });
    if (!company) throw { status: 404, message: 'Company not found' };
    return company;
  },

  async create(data: any, userId: string) {
    const existing = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (existing) throw { status: 400, message: 'You already have a company' };
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    const company = await prisma.company.create({ data: { ...data, slug, ownerId: userId } });
    clearCache('companies');
    logger.info(`Company created: ${company.name}`);
    return company;
  },

  async update(companyId: string, data: any, userId: string, userRole: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw { status: 404, message: 'Company not found' };
    if (userRole !== 'ADMIN' && company.ownerId !== userId) throw { status: 403, message: 'Not authorized' };
    const updated = await prisma.company.update({ where: { id: companyId }, data });
    clearCache('companies');
    return updated;
  },

  async getMyCompany(userId: string) {
    return prisma.company.findUnique({ where: { ownerId: userId }, include: { _count: { select: { jobs: true, reviews: true } } } });
  },
};
