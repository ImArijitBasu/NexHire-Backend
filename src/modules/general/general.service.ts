import prisma from '../../lib/prisma';

export const generalService = {
  async submitContact(data: { name: string; email: string; subject: string; message: string }) {
    if (!data.name || !data.email || !data.subject || !data.message) throw { status: 400, message: 'All fields are required' };
    return prisma.contact.create({ data });
  },

  async subscribeNewsletter(email: string) {
    if (!email) throw { status: 400, message: 'Email is required' };
    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) throw { status: 400, message: 'Already subscribed' };
    return prisma.newsletter.create({ data: { email } });
  },

  async getNotifications(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);
    return { notifications, unreadCount };
  },

  async markNotificationRead(notifId: string) {
    return prisma.notification.update({ where: { id: notifId }, data: { read: true } });
  },

  async markAllNotificationsRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  },

  async createReview(userId: string, data: { companyId: string; rating: number; title: string; content: string; pros?: string; cons?: string }) {
    return prisma.review.create({ data: { ...data, userId }, include: { user: { select: { name: true, image: true } } } });
  },

  async getReviews(companyId: string) {
    const reviews = await prisma.review.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, image: true } } } });
    const avgRating = reviews.length > 0 ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;
    return { reviews, avgRating };
  },

  async getPublicStats() {
    const [totalJobs, totalCompanies, totalUsers, totalApplications] = await Promise.all([
      prisma.job.count({ where: { status: 'ACTIVE' } }), prisma.company.count(), prisma.user.count(), prisma.application.count(),
    ]);
    return { totalJobs, totalCompanies, totalUsers, totalApplications };
  },
};
