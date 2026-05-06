import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility is needed'),
  skills: z.array(z.string()).min(1, 'At least one skill is needed'),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'REMOTE']),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('USD'),
  location: z.string().min(1, 'Location is required'),
  isRemote: z.boolean().default(false),
  deadline: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED']).optional(),
  featured: z.boolean().optional(),
});

export const jobQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  experienceLevel: z.string().optional(),
  location: z.string().optional(),
  minSalary: z.string().optional(),
  maxSalary: z.string().optional(),
  isRemote: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'salary_high', 'salary_low', 'popular']).default('newest'),
  page: z.string().default('1'),
  limit: z.string().default('12'),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;
