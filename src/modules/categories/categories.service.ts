import prisma from '../../lib/prisma';
import { clearCache } from '../../middleware/cache';

export const categoriesService = {
  async getAll() {
    return prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { jobs: true } } } });
  },
  async create(data: { name: string; icon?: string; description?: string }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = await prisma.category.create({ data: { ...data, slug } });
    clearCache('categories');
    return category;
  },
  async update(id: string, data: any) {
    const category = await prisma.category.update({ where: { id }, data });
    clearCache('categories');
    return category;
  },
  async delete(id: string) {
    await prisma.category.delete({ where: { id } });
    clearCache('categories');
  },
};
