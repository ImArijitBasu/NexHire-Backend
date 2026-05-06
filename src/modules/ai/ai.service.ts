import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { geminiModel, geminiChatModel } from '../../lib/gemini';

export const aiService = {
  async analyzeResume(userId: string, resumeText: string, targetRole?: string) {
    const prompt = `You are an expert career consultant. Analyze this resume${targetRole ? ` for a ${targetRole} position` : ''}.

Resume:
${resumeText}

Return JSON:
{
  "overallScore": <1-100>,
  "summary": "<brief assessment>",
  "strengths": ["<strength>"],
  "weaknesses": ["<weakness>"],
  "suggestions": ["<actionable suggestion>"],
  "missingKeywords": ["<keyword>"],
  "formattingTips": ["<tip>"],
  "skillsAnalysis": { "technical": ["<skill>"], "soft": ["<skill>"], "missing": ["<skill to add>"] },
  "atsScore": <1-100>,
  "industryFit": "<assessment>"
}`;

    const result = await geminiModel.generateContent(prompt);
    const analysis = JSON.parse(result.response.text());

    await prisma.aiTripPlan.create({
      data: { userId, title: `Resume Analysis${targetRole ? ` - ${targetRole}` : ''}`, input: { resumeText: resumeText.substring(0, 500), targetRole } as any, result: analysis as any, type: 'resume_analysis' },
    });

    logger.info(`AI Resume Analysis for user ${userId}`);
    return analysis;
  },

  async generateCoverLetter(userId: string, userName: string, data: { jobTitle: string; company: string; jobDescription?: string; userSkills?: string[]; experience?: string }) {
    const prompt = `Generate a professional cover letter.

Applicant: ${userName}
Job Title: ${data.jobTitle}
Company: ${data.company}
Job Description: ${data.jobDescription || 'Not provided'}
Skills: ${data.userSkills?.join(', ') || 'Not specified'}
Experience: ${data.experience || 'Not specified'}

Return JSON:
{
  "coverLetter": "<full cover letter with proper formatting>",
  "keyPoints": ["<selling point>"],
  "tone": "<professional/creative/technical>",
  "wordCount": <number>,
  "tips": ["<personalization tip>"]
}`;

    const result = await geminiModel.generateContent(prompt);
    const coverLetter = JSON.parse(result.response.text());

    await prisma.aiTripPlan.create({
      data: { userId, title: `Cover Letter - ${data.jobTitle} at ${data.company}`, input: data as any, result: coverLetter as any, type: 'cover_letter' },
    });

    return coverLetter;
  },

  async matchJobs(userId: string, preferences?: any) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { skills: true, bio: true, location: true } });
    const jobs = await prisma.job.findMany({
      where: { status: 'ACTIVE' }, take: 50, orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, description: true, skills: true, type: true, experienceLevel: true, salaryMin: true, salaryMax: true, location: true, isRemote: true, company: { select: { name: true, slug: true } } },
    });

    const prompt = `Match best jobs for this candidate.

Candidate: Skills: ${user?.skills?.join(', ') || preferences?.skills || 'Not specified'}, Bio: ${user?.bio || 'N/A'}, Location: ${user?.location || 'Flexible'}, Preferences: ${preferences?.description || 'Open'}

Jobs:
${JSON.stringify(jobs.map(j => ({ id: j.id, title: j.title, company: j.company.name, skills: j.skills, type: j.type, level: j.experienceLevel, salary: j.salaryMin && j.salaryMax ? `$${j.salaryMin}-$${j.salaryMax}` : 'N/A', location: j.location, remote: j.isRemote })), null, 2)}

Return top 10 matches as JSON:
{
  "matches": [{ "jobId": "<id>", "matchScore": <1-100>, "reasons": ["<reason>"], "missingSkills": ["<skill>"], "recommendation": "<brief>" }],
  "careerAdvice": "<advice>",
  "trendingSkills": ["<skill>"]
}`;

    const result = await geminiModel.generateContent(prompt);
    const matchResult = JSON.parse(result.response.text());

    const enriched = matchResult.matches?.map((m: any) => {
      const job = jobs.find(j => j.id === m.jobId);
      return { ...m, job };
    }).filter((m: any) => m.job) || [];

    await prisma.aiTripPlan.create({
      data: { userId, title: 'Job Match Analysis', input: { skills: user?.skills, preferences } as any, result: { ...matchResult, matches: enriched } as any, type: 'job_match' },
    });

    return { ...matchResult, matches: enriched };
  },

  async interviewChat(userId: string, data: { message: string; sessionId?: string; jobTitle?: string; company?: string }) {
    const chatSessionId = data.sessionId || `interview-${Date.now()}`;
    const history = await prisma.chatMessage.findMany({ where: { userId, sessionId: chatSessionId }, orderBy: { createdAt: 'asc' }, take: 20 });

    const systemPrompt = `You are NexHire's AI Interview Coach — friendly, encouraging, expert career mentor.${data.jobTitle ? ` Candidate is preparing for ${data.jobTitle}${data.company ? ` at ${data.company}` : ''}.` : ''} Help with mock interviews, behavioral questions, STAR method, salary negotiation. Keep responses concise and actionable.`;

    const chatHistory = history.map(h => ({ role: h.role as 'user' | 'model', parts: [{ text: h.content }] }));
    const chat = geminiChatModel.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "I'm NexHire's AI Interview Coach! Ready to help you ace your next interview. What would you like to practice?" }] },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(data.message);
    const responseText = result.response.text();

    await prisma.chatMessage.createMany({
      data: [
        { userId, sessionId: chatSessionId, role: 'user', content: data.message },
        { userId, sessionId: chatSessionId, role: 'model', content: responseText },
      ],
    });

    return { response: responseText, sessionId: chatSessionId };
  },

  async getHistory(userId: string, query: { type?: string; page?: string; limit?: string }) {
    const where: any = { userId };
    if (query.type) where.type = query.type;
    const pageNum = parseInt(query.page || '1');
    const limitNum = parseInt(query.limit || '10');

    const [results, total] = await Promise.all([
      prisma.aiTripPlan.findMany({ where, skip: (pageNum - 1) * limitNum, take: limitNum, orderBy: { createdAt: 'desc' } }),
      prisma.aiTripPlan.count({ where }),
    ]);
    return { results, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
  },

  async getChatSessions(userId: string) {
    return prisma.chatMessage.findMany({ where: { userId }, distinct: ['sessionId'], orderBy: { createdAt: 'desc' }, select: { sessionId: true, createdAt: true } });
  },

  async getChatMessages(userId: string, sessionId: string) {
    return prisma.chatMessage.findMany({ where: { userId, sessionId }, orderBy: { createdAt: 'asc' } });
  },
};
