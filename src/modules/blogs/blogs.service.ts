import prisma from '../../lib/prisma';
import logger from '../../lib/logger';

export const blogsService = {
  async getAll(query: { search?: string; tag?: string; page?: string; limit?: string }) {
    const where: any = { published: true };
    if (query.search) { where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }, { content: { contains: query.search, mode: 'insensitive' } }]; }
    if (query.tag) where.tags = { has: query.tag };
    const pageNum = parseInt(query.page || '1');
    const limitNum = parseInt(query.limit || '9');

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({ where, skip: (pageNum - 1) * limitNum, take: limitNum, orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true, image: true } } } }),
      prisma.blog.count({ where }),
    ]);
    return { blogs, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
  },

  async getBySlug(slug: string) {
    const blog = await prisma.blog.findUnique({ where: { slug }, include: { author: { select: { name: true, image: true, bio: true } } } });
    if (!blog) throw { status: 404, message: 'Blog not found' };
    await prisma.blog.update({ where: { id: blog.id }, data: { views: { increment: 1 } } });
    return blog;
  },

  async create(data: any, authorId: string) {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    return prisma.blog.create({ data: { ...data, slug, authorId }, include: { author: { select: { name: true, image: true } } } });
  },

  async update(id: string, data: any, userId: string, userRole: string) {
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) throw { status: 404, message: 'Blog not found' };
    if (userRole !== 'ADMIN' && blog.authorId !== userId) throw { status: 403, message: 'Not authorized' };
    return prisma.blog.update({ where: { id }, data });
  },

  async delete(id: string, userId: string, userRole: string) {
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) throw { status: 404, message: 'Blog not found' };
    if (userRole !== 'ADMIN' && blog.authorId !== userId) throw { status: 403, message: 'Not authorized' };
    await prisma.blog.delete({ where: { id } });
  },

  async getAllAdmin(query: { search?: string; page?: string; limit?: string }) {
    const where: any = {};
    if (query.search) where.title = { contains: query.search, mode: 'insensitive' };
    const pageNum = parseInt(query.page || '1');
    const limitNum = parseInt(query.limit || '10');

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({ where, skip: (pageNum - 1) * limitNum, take: limitNum, orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } }),
      prisma.blog.count({ where }),
    ]);
    return { blogs, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
  },
};
