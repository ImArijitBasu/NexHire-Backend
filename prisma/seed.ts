import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.chatMessage.deleteMany();
  await prisma.aiTripPlan.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.review.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.category.deleteMany();
  await prisma.company.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 12);

  // Create users
  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@nexhire.com', password, role: 'ADMIN', emailVerified: true, bio: 'Platform administrator', location: 'San Francisco, CA', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
  });

  const employer1 = await prisma.user.create({
    data: { name: 'Sarah Chen', email: 'employer@nexhire.com', password, role: 'EMPLOYER', emailVerified: true, bio: 'HR Director at TechCorp', location: 'New York, NY', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
  });

  const employer2 = await prisma.user.create({
    data: { name: 'Mike Johnson', email: 'mike@nexhire.com', password, role: 'EMPLOYER', emailVerified: true, bio: 'CTO at DataFlow Inc', location: 'Austin, TX', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' },
  });

  const seeker1 = await prisma.user.create({
    data: { name: 'Alex Rivera', email: 'seeker@nexhire.com', password, role: 'SEEKER', emailVerified: true, bio: 'Full Stack Developer with 3 years of experience', location: 'Los Angeles, CA', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'], image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
  });

  const seeker2 = await prisma.user.create({
    data: { name: 'Emma Wilson', email: 'emma@nexhire.com', password, role: 'SEEKER', emailVerified: true, bio: 'UX Designer passionate about creating intuitive experiences', location: 'Seattle, WA', skills: ['Figma', 'Adobe XD', 'CSS', 'User Research', 'Prototyping'], image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma' },
  });

  // Create companies
  const company1 = await prisma.company.create({
    data: { name: 'TechCorp Solutions', slug: 'techcorp-solutions', description: 'Leading technology company specializing in enterprise software solutions and cloud computing. We build tools that empower businesses worldwide.', industry: 'Technology', size: '500-1000', founded: '2015', website: 'https://techcorp.com', location: 'New York, NY', email: 'careers@techcorp.com', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=techcorp', verified: true, ownerId: employer1.id },
  });

  const company2 = await prisma.company.create({
    data: { name: 'DataFlow Inc', slug: 'dataflow-inc', description: 'Data analytics and AI company helping organizations make data-driven decisions with cutting-edge machine learning pipelines.', industry: 'AI & Data', size: '100-500', founded: '2018', website: 'https://dataflow.io', location: 'Austin, TX', email: 'jobs@dataflow.io', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=dataflow', verified: true, ownerId: employer2.id },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Software Engineering', slug: 'software-engineering', icon: '💻', description: 'Build and maintain software systems' } }),
    prisma.category.create({ data: { name: 'Product & Design', slug: 'product-design', icon: '🎨', description: 'Design and manage products' } }),
    prisma.category.create({ data: { name: 'Data Science', slug: 'data-science', icon: '📊', description: 'Analyze and interpret data' } }),
    prisma.category.create({ data: { name: 'DevOps & Cloud', slug: 'devops-cloud', icon: '☁️', description: 'Infrastructure and deployment' } }),
    prisma.category.create({ data: { name: 'Marketing', slug: 'marketing', icon: '📢', description: 'Drive growth and engagement' } }),
    prisma.category.create({ data: { name: 'Sales', slug: 'sales', icon: '💼', description: 'Revenue and client relations' } }),
    prisma.category.create({ data: { name: 'Human Resources', slug: 'human-resources', icon: '👥', description: 'People and culture' } }),
    prisma.category.create({ data: { name: 'Finance', slug: 'finance', icon: '💰', description: 'Financial planning and analysis' } }),
    prisma.category.create({ data: { name: 'Cybersecurity', slug: 'cybersecurity', icon: '🔒', description: 'Protect digital assets' } }),
    prisma.category.create({ data: { name: 'Mobile Development', slug: 'mobile-development', icon: '📱', description: 'iOS and Android development' } }),
  ]);

  // Create jobs
  const jobsData = [
    { title: 'Senior Full Stack Developer', description: 'We are looking for a Senior Full Stack Developer to join our engineering team. You will be responsible for designing, developing, and maintaining web applications using modern technologies. This role requires strong problem-solving skills and the ability to work in a fast-paced environment. You will collaborate with cross-functional teams to deliver high-quality software solutions.', requirements: ['5+ years of experience', 'React/Next.js proficiency', 'Node.js/Express expertise', 'Database design skills', 'CI/CD experience'], responsibilities: ['Design and develop web applications', 'Code review and mentoring', 'System architecture decisions', 'Performance optimization', 'Technical documentation'], skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'], type: 'FULL_TIME' as const, experienceLevel: 'SENIOR' as const, salaryMin: 120000, salaryMax: 180000, location: 'New York, NY', isRemote: true, benefits: ['Health Insurance', '401k Match', 'Remote Work', 'Stock Options', 'Learning Budget'], featured: true, companyId: company1.id, categoryId: categories[0].id },
    { title: 'UX/UI Designer', description: 'Join our design team to create beautiful, intuitive user experiences. You will work closely with product managers and engineers to translate complex requirements into elegant designs. We value creativity, attention to detail, and a deep understanding of user behavior.', requirements: ['3+ years of UX/UI experience', 'Figma/Sketch proficiency', 'Portfolio required', 'User research experience', 'Design system knowledge'], responsibilities: ['Create wireframes and prototypes', 'Conduct user research', 'Design system maintenance', 'Collaborate with engineering', 'Usability testing'], skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems'], type: 'FULL_TIME' as const, experienceLevel: 'MID' as const, salaryMin: 90000, salaryMax: 140000, location: 'San Francisco, CA', isRemote: true, benefits: ['Health Insurance', 'Flexible Hours', 'Design Conferences', 'Equipment Budget'], featured: true, companyId: company1.id, categoryId: categories[1].id },
    { title: 'Machine Learning Engineer', description: 'We need a talented ML Engineer to build and deploy machine learning models at scale. You will work on our recommendation engine and predictive analytics platform, handling large datasets and building production-ready ML pipelines.', requirements: ['MS/PhD in CS or related field', 'Python/TensorFlow/PyTorch', '3+ years ML experience', 'Experience with large datasets', 'Strong statistics background'], responsibilities: ['Develop ML models', 'Data pipeline design', 'Model optimization', 'A/B testing', 'Research and development'], skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Spark', 'Kubernetes'], type: 'FULL_TIME' as const, experienceLevel: 'SENIOR' as const, salaryMin: 150000, salaryMax: 220000, location: 'Austin, TX', isRemote: false, benefits: ['Health Insurance', 'Research Budget', 'Conference Attendance', 'GPU Access'], featured: true, companyId: company2.id, categoryId: categories[2].id },
    { title: 'Frontend React Developer', description: 'Looking for a passionate Frontend Developer to build responsive web applications using React and Next.js. You will be part of an agile team working on our customer-facing products.', requirements: ['2+ years React experience', 'TypeScript knowledge', 'CSS/Tailwind proficiency', 'Testing experience', 'Git workflow'], responsibilities: ['Build React components', 'Implement designs', 'Write unit tests', 'Performance optimization', 'Code reviews'], skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Jest'], type: 'FULL_TIME' as const, experienceLevel: 'MID' as const, salaryMin: 80000, salaryMax: 120000, location: 'Remote', isRemote: true, benefits: ['Remote Work', 'Health Insurance', 'Learning Stipend'], featured: true, companyId: company1.id, categoryId: categories[0].id },
    { title: 'DevOps Engineer', description: 'Seeking a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. You will ensure our systems are reliable, scalable, and secure.', requirements: ['3+ years DevOps experience', 'AWS/GCP expertise', 'Kubernetes knowledge', 'Terraform/IaC', 'Monitoring tools'], responsibilities: ['Infrastructure management', 'CI/CD pipeline design', 'Security hardening', 'Incident response', 'Cost optimization'], skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Prometheus'], type: 'FULL_TIME' as const, experienceLevel: 'MID' as const, salaryMin: 100000, salaryMax: 150000, location: 'Austin, TX', isRemote: true, benefits: ['Health Insurance', 'Remote Work', 'On-Call Bonus'], featured: false, companyId: company2.id, categoryId: categories[3].id },
    { title: 'Junior Backend Developer', description: 'Great opportunity for a Junior Backend Developer to grow their career. You will learn from senior engineers while contributing to real projects using Node.js and Python.', requirements: ['0-2 years experience', 'JavaScript/Python basics', 'REST API understanding', 'SQL knowledge', 'Eager to learn'], responsibilities: ['Write API endpoints', 'Database queries', 'Bug fixing', 'Documentation', 'Testing'], skills: ['Node.js', 'Python', 'SQL', 'Git', 'REST APIs'], type: 'FULL_TIME' as const, experienceLevel: 'ENTRY' as const, salaryMin: 55000, salaryMax: 75000, location: 'New York, NY', isRemote: false, benefits: ['Mentorship Program', 'Health Insurance', 'Learning Budget'], featured: false, companyId: company1.id, categoryId: categories[0].id },
    { title: 'Data Analyst Intern', description: 'Summer internship for aspiring data analysts. Work with real data and learn industry best practices while gaining hands-on experience with analytics tools.', requirements: ['Currently enrolled in university', 'Basic SQL/Python', 'Statistics knowledge', 'Excel proficiency', 'Strong communication'], responsibilities: ['Data analysis', 'Report creation', 'Dashboard building', 'Data cleaning', 'Presentations'], skills: ['SQL', 'Python', 'Excel', 'Tableau', 'Statistics'], type: 'INTERNSHIP' as const, experienceLevel: 'ENTRY' as const, salaryMin: 25000, salaryMax: 35000, location: 'Austin, TX', isRemote: true, benefits: ['Mentorship', 'Flexible Hours', 'Conversion Opportunity'], featured: false, companyId: company2.id, categoryId: categories[2].id },
    { title: 'Product Manager', description: 'Lead product strategy and execution for our enterprise platform. You will define the product roadmap, prioritize features, and work closely with engineering and design teams.', requirements: ['5+ years PM experience', 'Technical background preferred', 'Agile methodology', 'Data-driven mindset', 'Strong communication'], responsibilities: ['Product strategy', 'Roadmap planning', 'Stakeholder management', 'Feature prioritization', 'Market research'], skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'Roadmapping'], type: 'FULL_TIME' as const, experienceLevel: 'SENIOR' as const, salaryMin: 130000, salaryMax: 180000, location: 'San Francisco, CA', isRemote: true, benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Leadership Training'], featured: true, companyId: company1.id, categoryId: categories[1].id },
    { title: 'Cybersecurity Analyst', description: 'Protect our organization from cyber threats. Monitor security systems, respond to incidents, and implement security best practices across the company.', requirements: ['2+ years security experience', 'Security certifications (CISSP/CEH)', 'Network security knowledge', 'Incident response', 'Compliance experience'], responsibilities: ['Threat monitoring', 'Incident response', 'Security audits', 'Policy development', 'Team training'], skills: ['SIEM', 'Firewalls', 'Penetration Testing', 'Compliance', 'Risk Assessment'], type: 'FULL_TIME' as const, experienceLevel: 'MID' as const, salaryMin: 95000, salaryMax: 135000, location: 'Washington, DC', isRemote: false, benefits: ['Health Insurance', 'Certification Sponsorship', 'Clearance Support'], featured: false, companyId: company2.id, categoryId: categories[8].id },
    { title: 'Mobile App Developer (React Native)', description: 'Build cross-platform mobile applications using React Native. Join our mobile team to create seamless experiences for iOS and Android users.', requirements: ['3+ years React Native', 'iOS/Android knowledge', 'App Store experience', 'State management', 'API integration'], responsibilities: ['Build mobile features', 'App performance', 'Cross-platform testing', 'App releases', 'Code reviews'], skills: ['React Native', 'TypeScript', 'Redux', 'iOS', 'Android'], type: 'CONTRACT' as const, experienceLevel: 'MID' as const, salaryMin: 90000, salaryMax: 130000, location: 'Remote', isRemote: true, benefits: ['Flexible Schedule', 'Equipment Provided', 'Project Bonus'], featured: true, companyId: company1.id, categoryId: categories[9].id },
    { title: 'Digital Marketing Manager', description: 'Drive our digital marketing strategy across all channels. Manage campaigns, analyze performance, and grow our brand presence in the tech industry.', requirements: ['4+ years marketing experience', 'SEO/SEM expertise', 'Analytics tools', 'Content strategy', 'Budget management'], responsibilities: ['Campaign management', 'Content strategy', 'Analytics reporting', 'Brand development', 'Team leadership'], skills: ['Google Analytics', 'SEO', 'Content Marketing', 'Social Media', 'Email Marketing'], type: 'FULL_TIME' as const, experienceLevel: 'MID' as const, salaryMin: 75000, salaryMax: 110000, location: 'New York, NY', isRemote: true, benefits: ['Health Insurance', 'Marketing Conferences', 'Remote Work'], featured: false, companyId: company1.id, categoryId: categories[4].id },
    { title: 'Cloud Solutions Architect', description: 'Design and implement cloud solutions for enterprise clients. Lead architecture decisions and ensure scalability and security of cloud deployments.', requirements: ['7+ years experience', 'AWS/Azure certifications', 'Microservices architecture', 'Security best practices', 'Client-facing experience'], responsibilities: ['Architecture design', 'Client consulting', 'Technical leadership', 'Cost optimization', 'Best practices'], skills: ['AWS', 'Azure', 'Microservices', 'Terraform', 'Security'], type: 'FULL_TIME' as const, experienceLevel: 'LEAD' as const, salaryMin: 160000, salaryMax: 230000, location: 'Seattle, WA', isRemote: true, benefits: ['Health Insurance', 'Stock Options', 'Travel Budget', 'Certification Budget'], featured: true, companyId: company2.id, categoryId: categories[3].id },
  ];

  for (const jobData of jobsData) {
    const slug = jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 8);
    await prisma.job.create({ data: { ...jobData, slug, views: Math.floor(Math.random() * 500) + 50 } });
  }

  // Create blogs
  const blogsData = [
    { title: 'Top 10 In-Demand Tech Skills for 2026', content: 'The tech industry continues to evolve at a rapid pace. In 2026, several skills have emerged as particularly valuable for job seekers. From AI/ML engineering to cloud-native development, understanding these trends can give you a significant advantage in the job market.\n\n## 1. AI & Machine Learning\nArtificial intelligence continues to dominate the tech landscape. Companies across every industry are seeking professionals who can build, deploy, and maintain AI systems.\n\n## 2. Cloud-Native Development\nWith the shift to microservices and containerization, cloud-native skills are essential. Knowledge of Kubernetes, Docker, and serverless architectures is highly sought after.\n\n## 3. Full Stack TypeScript\nTypeScript has become the de facto standard for full-stack development. Proficiency in frameworks like Next.js, combined with Node.js backends, is extremely valuable.\n\n## 4. Cybersecurity\nAs threats evolve, so does the need for security professionals. Zero-trust architecture and DevSecOps practices are becoming standard requirements.\n\n## 5. Data Engineering\nThe ability to build and maintain data pipelines is crucial. Skills in tools like Apache Spark, Kafka, and modern data warehousing solutions are in high demand.', excerpt: 'Discover the most sought-after tech skills that will help you land your dream job in 2026.', coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800', tags: ['career', 'skills', 'technology'], published: true, authorId: admin.id },
    { title: 'How to Ace Your Technical Interview', content: 'Technical interviews can be daunting, but with the right preparation, you can walk in with confidence. This guide covers everything from data structures to system design.\n\n## Preparation Strategy\nStart preparing at least 4-6 weeks before your interview. Create a study plan that covers:\n- Data structures and algorithms\n- System design fundamentals\n- Behavioral questions\n- Company-specific preparation\n\n## During the Interview\n- Think out loud and explain your approach\n- Ask clarifying questions before diving in\n- Consider edge cases\n- Test your solution with examples\n\n## Common Mistakes to Avoid\n- Not asking clarifying questions\n- Jumping straight into coding without planning\n- Ignoring time and space complexity\n- Not practicing mock interviews', excerpt: 'A comprehensive guide to preparing for and acing your next technical interview.', coverImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800', tags: ['interview', 'career', 'tips'], published: true, authorId: admin.id },
    { title: 'Remote Work Best Practices in 2026', content: 'Remote work has become a permanent fixture in the tech industry. Here are proven strategies for staying productive and maintaining work-life balance.\n\n## Setting Up Your Workspace\nInvest in a proper desk, ergonomic chair, and good lighting. Your workspace significantly impacts your productivity and health.\n\n## Communication\nOver-communicate with your team. Use async tools effectively and be responsive during core hours.\n\n## Time Management\nUse techniques like time-blocking and the Pomodoro method to maintain focus throughout the day.', excerpt: 'Master the art of remote work with these proven strategies for productivity and balance.', coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', tags: ['remote-work', 'productivity', 'career'], published: true, authorId: admin.id },
    { title: 'Building Your Personal Brand as a Developer', content: 'In a competitive job market, a strong personal brand can set you apart. Learn how to build your online presence, contribute to open source, and establish yourself as a thought leader.\n\n## Start a Blog\nShare your knowledge through technical blog posts. This demonstrates your expertise and helps others in the community.\n\n## Contribute to Open Source\nOpen source contributions show real-world coding skills and collaboration abilities.\n\n## Network Strategically\nAttend conferences, join communities, and connect with professionals in your field.', excerpt: 'Learn how to build a strong personal brand that attracts opportunities and advances your career.', coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', tags: ['branding', 'career', 'networking'], published: true, authorId: admin.id },
  ];

  for (const blogData of blogsData) {
    const slug = blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 8);
    await prisma.blog.create({ data: { ...blogData, slug, views: Math.floor(Math.random() * 200) + 20 } });
  }

  // Create reviews
  await prisma.review.createMany({
    data: [
      { userId: seeker1.id, companyId: company1.id, rating: 5, title: 'Great work culture', content: 'Amazing company with excellent benefits and work-life balance. The team is supportive and the projects are challenging.', pros: 'Great benefits, remote work, smart colleagues', cons: 'Fast-paced, can be intense during releases' },
      { userId: seeker2.id, companyId: company1.id, rating: 4, title: 'Good learning environment', content: 'Learned a lot during my time here. The mentorship program is excellent and there are plenty of growth opportunities.', pros: 'Learning opportunities, mentorship', cons: 'Could improve communication' },
      { userId: seeker1.id, companyId: company2.id, rating: 4, title: 'Innovative company', content: 'Working on cutting-edge AI technology is exciting. The team is talented and the culture encourages innovation.', pros: 'Cutting-edge tech, smart team', cons: 'Startup pace can be demanding' },
    ],
  });

  // Create sample applications
  const jobs = await prisma.job.findMany({ take: 3 });
  if (jobs.length >= 3) {
    await prisma.application.createMany({
      data: [
        { userId: seeker1.id, jobId: jobs[0].id, coverLetter: 'I am excited about this opportunity and believe my skills in React and Node.js make me a strong candidate.', status: 'PENDING' },
        { userId: seeker1.id, jobId: jobs[2].id, coverLetter: 'With my background in data analysis, I am confident I can contribute to your ML team.', status: 'REVIEWED' },
        { userId: seeker2.id, jobId: jobs[1].id, coverLetter: 'As a passionate UX designer, I would love to bring my expertise to your design team.', status: 'SHORTLISTED' },
      ],
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Demo Credentials:');
  console.log('Admin:    admin@nexhire.com / password123');
  console.log('Employer: employer@nexhire.com / password123');
  console.log('Seeker:   seeker@nexhire.com / password123');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
