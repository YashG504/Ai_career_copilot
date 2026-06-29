import { GoogleGenerativeAI } from '@google/generative-ai';
import { IResumeAnalysis } from '../models/Resume';

const ANALYSIS_PROMPT = `You are an expert career advisor and ATS (Applicant Tracking System) specialist. Analyze the following resume text and provide a comprehensive evaluation.

Return your analysis as a valid JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "atsScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "summary": "<brief 2-3 sentence summary of the resume>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", ...],
  "technicalSkills": ["<skill found in resume>", ...],
  "softSkills": ["<soft skill found or inferred>", ...],
  "grammarIssues": ["<issue 1>", "<issue 2>", ...],
  "formattingSuggestions": ["<suggestion 1>", "<suggestion 2>", ...],
  "improvements": ["<actionable improvement 1>", "<actionable improvement 2>", ...],
  "experienceLevel": "<entry-level | mid-level | senior | executive>"
}

ATS Score criteria:
- Keyword density and relevance (30%)
- Formatting compatibility (20%)
- Section organization (15%)
- Quantified achievements (15%)
- Skills section completeness (10%)
- Contact information (10%)

Be specific, actionable, and honest. Provide at least 3 items for each array field.

RESUME TEXT:
`;

const COMPARISON_PROMPT = `You are an expert career advisor. Compare these two resume versions and provide detailed improvement analysis.

Return your analysis as a valid JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "overallImprovement": <number -100 to 100, positive means V2 is better>,
  "atsScoreChange": <number change>,
  "summary": "<2-3 sentence comparison summary>",
  "improvements": ["<what got better>", ...],
  "regressions": ["<what got worse, if any>", ...],
  "recommendations": ["<what to do next>", ...]
}

RESUME V1:
{RESUME_V1}

RESUME V2:
{RESUME_V2}
`;

export async function analyzeResumeWithAI(resumeText: string): Promise<IResumeAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY not set. Returning mock analysis.');
    return getMockAnalysis();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(ANALYSIS_PROMPT + resumeText);
    const responseText = result.response.text();

    // Clean response - strip markdown code fences if present
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleaned);

    return {
      atsScore: analysis.atsScore || 0,
      overallScore: analysis.overallScore || 0,
      summary: analysis.summary || '',
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      missingKeywords: analysis.missingKeywords || [],
      technicalSkills: analysis.technicalSkills || [],
      softSkills: analysis.softSkills || [],
      grammarIssues: analysis.grammarIssues || [],
      formattingSuggestions: analysis.formattingSuggestions || [],
      improvements: analysis.improvements || [],
      experienceLevel: analysis.experienceLevel || 'entry-level',
      analyzedAt: new Date(),
    };
  } catch (error) {
    console.error('AI Analysis error:', error);
    return getMockAnalysis();
  }
}

export async function compareResumesWithAI(
  resumeV1Text: string,
  resumeV2Text: string
): Promise<any | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      overallImprovement: 0,
      atsScoreChange: 0,
      summary: 'AI comparison requires a Gemini API key. Please configure GEMINI_API_KEY.',
      improvements: [],
      regressions: [],
      recommendations: ['Configure your Gemini API key to enable AI-powered comparison.'],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = COMPARISON_PROMPT
      .replace('{RESUME_V1}', resumeV1Text)
      .replace('{RESUME_V2}', resumeV2Text);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('AI Comparison error:', error);
    return null;
  }
}

function getMockAnalysis(): IResumeAnalysis {
  return {
    atsScore: 62,
    overallScore: 58,
    summary:
      'This resume has a solid structure but needs improvements in keyword optimization and quantified achievements to pass most ATS systems.',
    strengths: [
      'Clear contact information provided',
      'Skills section is present',
      'Education details are included',
    ],
    weaknesses: [
      'Lack of quantified achievements (use numbers, percentages)',
      'Missing industry-standard keywords',
      'Job descriptions are too generic',
    ],
    missingKeywords: [
      'Agile', 'CI/CD', 'REST API', 'Unit Testing', 'Problem Solving',
      'Cross-functional', 'Stakeholder Management',
    ],
    technicalSkills: ['JavaScript', 'React', 'Node.js'],
    softSkills: ['Communication', 'Teamwork'],
    grammarIssues: [
      'Consider using active voice throughout',
      'Some bullet points lack action verbs',
    ],
    formattingSuggestions: [
      'Use a single-column layout for better ATS parsing',
      'Ensure consistent date formatting (MM/YYYY)',
      'Keep resume to 1-2 pages maximum',
    ],
    improvements: [
      'Add quantified achievements (e.g., "Increased performance by 30%")',
      'Include a professional summary at the top',
      'Add relevant certifications if available',
      'Tailor keywords to specific job descriptions',
    ],
    experienceLevel: 'entry-level',
    analyzedAt: new Date(),
  };
}

// ─── Job Match AI ────────────────────────────────────────────────────────────

const JOB_MATCH_PROMPT = `You are an expert career advisor and recruiter. Compare the following resume against the job description and provide a detailed match analysis.

Return your analysis as a valid JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "summary": "<2-3 sentence match summary>",
  "matchScore": <number 0-100>,
  "matchingSkills": ["<skill that matches>", ...],
  "missingSkills": ["<skill the candidate is missing>", ...],
  "suggestedProjects": [
    {
      "title": "<project name>",
      "description": "<1-2 sentence description of a project to build>",
      "skills": ["<skill this project demonstrates>", ...]
    }
  ],
  "resumeImprovements": ["<specific improvement for this JD>", ...],
  "keywordMatch": {
    "found": ["<keyword from JD found in resume>", ...],
    "missing": ["<keyword from JD missing in resume>", ...]
  },
  "experienceFit": "<strong fit | moderate fit | weak fit — with 1 sentence explanation>",
  "cultureFit": "<1-2 sentence assessment of soft skill and culture alignment>"
}

Scoring criteria:
- Skills overlap (40%)
- Experience relevance (25%)
- Keyword match (20%)
- Education/certifications alignment (15%)

Provide at least 3 items for matchingSkills, missingSkills, and resumeImprovements.
Provide exactly 3 suggestedProjects that would help the candidate fill their skill gaps.

RESUME TEXT:
{RESUME_TEXT}

JOB DESCRIPTION:
{JOB_DESCRIPTION}
`;

export async function matchJobWithResumeAI(
  resumeText: string,
  jobDescription: string
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY not set. Returning mock match.');
    return getMockJobMatch();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = JOB_MATCH_PROMPT
      .replace('{RESUME_TEXT}', resumeText)
      .replace('{JOB_DESCRIPTION}', jobDescription);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Job Match AI error:', error);
    return getMockJobMatch();
  }
}

function getMockJobMatch() {
  return {
    summary: 'The candidate has some relevant skills but significant gaps exist in required technologies. Focus on building projects that demonstrate the missing competencies.',
    matchScore: 55,
    matchingSkills: ['JavaScript', 'React', 'Git', 'Problem Solving'],
    missingSkills: ['TypeScript', 'AWS', 'Docker', 'CI/CD', 'PostgreSQL', 'System Design'],
    suggestedProjects: [
      {
        title: 'Cloud-Deployed REST API',
        description: 'Build a full REST API with Express/NestJS, deploy on AWS with Docker and CI/CD pipeline.',
        skills: ['AWS', 'Docker', 'CI/CD', 'TypeScript'],
      },
      {
        title: 'Real-time Dashboard',
        description: 'Create a real-time analytics dashboard using WebSockets and PostgreSQL for data persistence.',
        skills: ['PostgreSQL', 'WebSockets', 'TypeScript'],
      },
      {
        title: 'Microservices Architecture',
        description: 'Design and implement a microservices system with event-driven communication and container orchestration.',
        skills: ['System Design', 'Docker', 'AWS'],
      },
    ],
    resumeImprovements: [
      'Add TypeScript experience — mention it explicitly in your skills section',
      'Include cloud deployment experience (AWS/GCP/Azure)',
      'Quantify the impact of your projects with metrics',
      'Add a "Technologies" subsection under each project',
    ],
    keywordMatch: {
      found: ['JavaScript', 'React', 'Node.js', 'REST API', 'Git'],
      missing: ['TypeScript', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'PostgreSQL', 'Agile', 'Scrum'],
    },
    experienceFit: 'Moderate fit — candidate has relevant frontend experience but lacks backend infrastructure and cloud skills required for this role.',
    cultureFit: 'The candidate shows strong communication and teamwork skills which align well with collaborative team environments.',
  };
}

// ─── Interview AI ────────────────────────────────────────────────────────────

export async function generateInterviewQuestionsAI(
  domain: string,
  type: 'technical' | 'hr' | 'coding',
  difficulty: string,
  count: number = 5
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are an expert ${type === 'hr' ? 'HR interviewer' : `${domain} technical interviewer`}.
Generate exactly ${count} ${difficulty} difficulty ${type} interview questions for a ${domain} developer role.

${type === 'technical' ? 'Focus on core concepts, system design, and practical knowledge.' : ''}
${type === 'hr' ? 'Use the STAR method format. Focus on behavioral, situational, and leadership questions.' : ''}
${type === 'coding' ? 'Provide coding problems with clear input/output requirements. Include the problem statement only, no solution.' : ''}

Return a valid JSON array of strings (no markdown, no code fences, just raw JSON):
["question 1", "question 2", ...]`;

  if (!apiKey) {
    return getDefaultQuestions(domain, type, count);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Generate questions error:', error);
    return getDefaultQuestions(domain, type, count);
  }
}

export async function evaluateAnswerAI(
  question: string,
  answer: string,
  domain: string,
  type: string
): Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are an expert ${domain} interviewer. Evaluate the following ${type} interview answer.

Question: ${question}
Candidate's Answer: ${answer}

Return a valid JSON object (no markdown, no code fences):
{
  "score": <number 0-100>,
  "feedback": "<2-3 sentence evaluation>",
  "strengths": ["<what was good>", ...],
  "improvements": ["<what could be better>", ...]
}

Be fair but thorough. Score based on:
- Accuracy & correctness (40%)
- Depth of explanation (25%)
- Communication clarity (20%)
- Practical examples mentioned (15%)`;

  if (!apiKey) {
    return { score: 65, feedback: 'Good attempt. Configure Gemini API key for real evaluations.', strengths: ['Attempted the question'], improvements: ['Add more depth'] };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Evaluate answer error:', error);
    return { score: 60, feedback: 'Evaluation failed.', strengths: [], improvements: [] };
  }
}

export async function generateInterviewReportAI(
  questions: { question: string; userAnswer: string; evaluation: any }[],
  domain: string,
  type: string
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;

  const qaPairs = questions.map((q, i) =>
    `Q${i + 1}: ${q.question}\nAnswer: ${q.userAnswer}\nScore: ${q.evaluation?.score || 0}/100`
  ).join('\n\n');

  const prompt = `You are an expert interviewer. Generate a comprehensive interview report.

Domain: ${domain}
Type: ${type}

Questions & Answers:
${qaPairs}

Return a valid JSON object (no markdown, no code fences):
{
  "overallScore": <number 0-100>,
  "summary": "<3-4 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "roadmap": ["<improvement step 1>", "<step 2>", ...],
  "topicBreakdown": [
    {"topic": "<topic name>", "score": <0-100>, "feedback": "<brief feedback>"}
  ]
}`;

  if (!apiKey) {
    const avgScore = questions.reduce((sum, q) => sum + (q.evaluation?.score || 0), 0) / questions.length;
    return {
      overallScore: Math.round(avgScore),
      summary: 'Interview completed. Configure Gemini API key for detailed reports.',
      strengths: ['Completed the interview'], weaknesses: ['Need more practice'],
      roadmap: ['Practice daily', 'Study core concepts'], topicBreakdown: [],
      generatedAt: new Date(),
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const report = JSON.parse(text);
    report.generatedAt = new Date();
    return report;
  } catch (error) {
    console.error('Generate report error:', error);
    return null;
  }
}

function getDefaultQuestions(domain: string, type: string, count: number): string[] {
  const technicalQs: Record<string, string[]> = {
    frontend: ['Explain the Virtual DOM in React and how it improves performance.', 'What is the difference between CSS Grid and Flexbox? When would you use each?', 'How does JavaScript event delegation work?', 'Explain the concept of closures in JavaScript with an example.', 'What are Web Vitals and how do you optimize them?'],
    backend: ['Explain RESTful API design principles.', 'What is the difference between SQL and NoSQL databases?', 'How do you handle authentication and authorization in a backend system?', 'Explain middleware in Express.js.', 'What are microservices and when should you use them?'],
    mern: ['Explain the MERN stack architecture.', 'How do you manage state in a React application?', 'How does MongoDB indexing work?', 'Explain JWT authentication flow.', 'How would you deploy a MERN stack application?'],
    default: ['Tell me about a challenging technical problem you solved.', 'How do you approach learning new technologies?', 'Explain your understanding of version control with Git.', 'What is your experience with agile development?', 'How do you ensure code quality?'],
  };
  const hrQs = ['Tell me about a time you handled a conflict in your team.', 'Describe a situation where you had to meet a tight deadline.', 'Give an example of when you showed leadership.', 'Tell me about a time you failed and what you learned.', 'How do you prioritize tasks when you have multiple deadlines?'];

  if (type === 'hr') return hrQs.slice(0, count);
  const pool = technicalQs[domain.toLowerCase()] || technicalQs['default']!;
  return pool.slice(0, count);
}

// ─── Skill Gap AI ────────────────────────────────────────────────────────────

export async function analyzeSkillGapAI(
  resumeText: string,
  jobDescription: string,
  jobTitle: string
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are an expert career advisor. Analyze the skill gap between this candidate's resume and the target job.

Return a valid JSON object (no markdown, no code fences):
{
  "summary": "<2-3 sentence skill gap summary>",
  "currentSkills": ["<skill the candidate has>", ...],
  "requiredSkills": ["<skill the job requires>", ...],
  "missingSkills": ["<skill the candidate is missing>", ...],
  "skillMatchPercentage": <number 0-100>,
  "learningRoadmap": [
    {
      "week": 1,
      "title": "<week theme>",
      "skills": ["<skill to learn>"],
      "tasks": ["<daily task 1>", "<daily task 2>"],
      "resources": ["<resource name or URL>"]
    }
  ],
  "recommendedCourses": [
    {
      "title": "<course name>",
      "platform": "<Udemy/Coursera/YouTube/etc>",
      "url": "<URL or search query>",
      "skill": "<skill it teaches>"
    }
  ],
  "suggestedProjects": [
    {
      "title": "<project name>",
      "description": "<1-2 sentence description>",
      "skills": ["<skill>"],
      "difficulty": "<beginner/intermediate/advanced>"
    }
  ]
}

Provide a 4-week learning roadmap with 2-3 tasks per week.
Provide at least 4 recommended courses and 3 suggested projects.

TARGET ROLE: ${jobTitle || 'Software Developer'}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  if (!apiKey) {
    return getMockSkillGap();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Skill gap error:', error);
    return getMockSkillGap();
  }
}

function getMockSkillGap() {
  return {
    summary: 'The candidate has foundational web development skills but lacks cloud, DevOps, and advanced backend expertise required for this role.',
    currentSkills: ['JavaScript', 'React', 'HTML/CSS', 'Git', 'Node.js'],
    requiredSkills: ['TypeScript', 'AWS', 'Docker', 'CI/CD', 'PostgreSQL', 'System Design', 'React', 'Node.js'],
    missingSkills: ['TypeScript', 'AWS', 'Docker', 'CI/CD', 'PostgreSQL', 'System Design'],
    skillMatchPercentage: 45,
    learningRoadmap: [
      { week: 1, title: 'TypeScript Fundamentals', skills: ['TypeScript'], tasks: ['Complete TypeScript handbook', 'Convert a JS project to TS'], resources: ['typescriptlang.org', 'TypeScript Deep Dive book'] },
      { week: 2, title: 'Database & Backend', skills: ['PostgreSQL'], tasks: ['Learn SQL basics', 'Build a CRUD API with PostgreSQL'], resources: ['SQLBolt.com', 'PostgreSQL Tutorial'] },
      { week: 3, title: 'Cloud & DevOps', skills: ['AWS', 'Docker'], tasks: ['Deploy an app to AWS', 'Dockerize a project'], resources: ['AWS Free Tier', 'Docker Getting Started'] },
      { week: 4, title: 'CI/CD & System Design', skills: ['CI/CD', 'System Design'], tasks: ['Set up GitHub Actions', 'Study system design patterns'], resources: ['GitHub Actions docs', 'System Design Primer'] },
    ],
    recommendedCourses: [
      { title: 'Understanding TypeScript', platform: 'Udemy', url: 'https://udemy.com', skill: 'TypeScript' },
      { title: 'AWS Cloud Practitioner', platform: 'Coursera', url: 'https://coursera.org', skill: 'AWS' },
      { title: 'Docker Mastery', platform: 'Udemy', url: 'https://udemy.com', skill: 'Docker' },
      { title: 'The Complete SQL Bootcamp', platform: 'Udemy', url: 'https://udemy.com', skill: 'PostgreSQL' },
    ],
    suggestedProjects: [
      { title: 'Full-Stack TypeScript App', description: 'Build a task manager with Next.js, tRPC, and PostgreSQL.', skills: ['TypeScript', 'PostgreSQL'], difficulty: 'intermediate' },
      { title: 'CI/CD Pipeline', description: 'Set up automated testing and deployment with GitHub Actions and Docker.', skills: ['CI/CD', 'Docker'], difficulty: 'intermediate' },
      { title: 'Cloud-Native Microservice', description: 'Deploy a microservice on AWS ECS with load balancing.', skills: ['AWS', 'Docker', 'System Design'], difficulty: 'advanced' },
    ],
  };
}
