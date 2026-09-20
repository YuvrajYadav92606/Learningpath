import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { courses } from '../data/courses.js';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Models in order of availability / speed for current API tier
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
];

/**
 * Robust wrapper that attempts candidate models with retries
 */
async function callGemini(contents, config = {}) {
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err) {
        lastError = err;
        const status = err.status || (err.error && err.error.code);
        // If 503 or 429, wait a short moment and retry or try next model
        if (status === 503 || status === 429) {
          await new Promise((r) => setTimeout(r, 800));
          continue; // retry once on this model
        }
        // If model not found or invalid, break immediately to next model
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini candidate models failed');
}

// ─── System prompt builder ────────────────────────────────────────────────────
function buildSystemInstruction(profile) {
  return `You are LearnAI, an expert personalized learning advisor with deep knowledge across all domains — technology, business, design, science, arts, mathematics, languages, and more.

Your mission is to help ${profile.name} achieve their learning goals through thoughtful, personalized guidance.

LEARNER PROFILE:
━━━━━━━━━━━━━━━
• Name: ${profile.name}
• Experience Level: ${profile.experienceLevel || 'beginner'}
• Interests: ${(profile.interests || []).join(', ') || 'Not yet specified'}
• Goals: ${(profile.goals || []).join(', ') || 'Not yet specified'}
• Learning Style: ${profile.learningStyle || 'mixed'}
• Weekly Hours Available: ${profile.weeklyHours || 5} hours/week
• Completed Courses: ${(profile.completedCourses || []).join(', ') || 'None yet'}
• Current Skills: ${(profile.skills || []).map((s) => `${s.name} (${s.level}%)`).join(', ') || 'Not specified'}

BEHAVIOR GUIDELINES:
━━━━━━━━━━━━━━━━━━━
1. Be warm, encouraging, and supportive — learning is a journey, not a race
2. Tailor language complexity to the learner's experience level
3. When goals are vague, ask 1-2 focused clarifying questions
4. Suggest specific, named resources with brief explanations
5. Reference their profile details to make responses feel personalized
6. Keep responses focused: 2-4 paragraphs max

SPECIAL ACTIONS (emit these tags when appropriate):
• When the user is ready to generate/update their learning path, emit: [ACTION:GENERATE_ROADMAP]
• When you detect profile information in conversation, emit: [ACTION:UPDATE_PROFILE:{"field":"value"}]
  Supported fields: experienceLevel, learningStyle, weeklyHours, interests (array), goals (array)

Examples:
- User says "I'm a total beginner" → emit [ACTION:UPDATE_PROFILE:{"experienceLevel":"beginner"}]
- User says "I want to learn web development" → emit [ACTION:UPDATE_PROFILE:{"goals":["Master web development"]}]
- User says "Generate my learning path" → emit [ACTION:GENERATE_ROADMAP]`;
}

// ─── Multi-turn chat ──────────────────────────────────────────────────────────
export async function chatWithContext(messages, profile) {
  const systemInstruction = buildSystemInstruction(profile);

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  let rawText = '';
  try {
    rawText = await callGemini(contents, {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 1024,
    });
  } catch (err) {
    console.warn('Gemini chat unavailable, generating contextual fallback:', err.message);
    rawText = buildFallbackChatReply(messages, profile);
  }

  // Parse embedded actions
  const actions = [];

  if (/\[ACTION:GENERATE_ROADMAP\]/.test(rawText)) {
    actions.push({ type: 'GENERATE_ROADMAP' });
  }

  const updateMatches = [...rawText.matchAll(/\[ACTION:UPDATE_PROFILE:(\{.*?\})\]/g)];
  for (const match of updateMatches) {
    try {
      actions.push({ type: 'UPDATE_PROFILE', data: JSON.parse(match[1]) });
    } catch {
      // malformed JSON — skip
    }
  }

  // Strip action tags from displayed text
  const cleanText = rawText
    .replace(/\[ACTION:GENERATE_ROADMAP\]/g, '')
    .replace(/\[ACTION:UPDATE_PROFILE:\{.*?\}\]/g, '')
    .trim();

  return { reply: cleanText, actions };
}

// ─── Learning path generator ──────────────────────────────────────────────────
export async function generateLearningPath(goal, profile) {
  const targetGoal = goal || (profile.goals || [])[0] || 'Become a well-rounded professional';

  const prompt = `You are a world-class curriculum designer. Create a comprehensive, personalized learning path.

LEARNER PROFILE:
• Name: ${profile.name}
• Experience Level: ${profile.experienceLevel || 'beginner'}
• Current Skills: ${(profile.skills || []).map((s) => s.name).join(', ') || 'None specified'}
• Completed Courses: ${(profile.completedCourses || []).join(', ') || 'None'}
• Learning Style: ${profile.learningStyle || 'mixed'}
• Weekly Hours: ${profile.weeklyHours || 5} hours/week
• Interests: ${(profile.interests || []).join(', ') || 'General'}

LEARNING GOAL: ${targetGoal}

Generate a structured, progressive learning path. Return ONLY valid JSON matching this schema exactly:

{
  "goal": "${targetGoal}",
  "totalDuration": "X months",
  "estimatedCompletion": "Month YYYY",
  "skillsToGain": ["skill1", "skill2", "skill3"],
  "prerequisites": ["prereq1"],
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase Title",
      "description": "What this phase covers and why",
      "order": 1,
      "skills": ["skill1", "skill2"],
      "milestones": [
        {
          "id": "m-1-1",
          "title": "Milestone Title",
          "description": "Concrete achievement to unlock",
          "resources": [
            {
              "id": "r-1-1-1",
              "title": "Exact resource title",
              "type": "course",
              "url": "https://real-platform.com/course",
              "duration": "X hours",
              "difficulty": "beginner",
              "skills": ["skill"],
              "description": "What you will learn in this resource",
              "whyRecommended": "2-3 sentences specifically explaining why this is perfect for ${profile.name} given their background and goal"
            }
          ]
        }
      ]
    }
  ]
}

REQUIREMENTS:
1. Create 3-4 phases (beginner → intermediate → advanced progression)
2. Each phase: 2 milestones
3. Each milestone: 2-3 resources (mix types: course, project, article, video)
4. Use REAL platforms: Coursera, Udemy, freeCodeCamp, Khan Academy, YouTube, MDN, The Odin Project, Codecademy, edX, Pluralsight, Scrimba, CS50, fast.ai
5. Make the whyRecommended truly personal to ${profile.name}'s profile
6. Adapt difficulty/pace to ${profile.weeklyHours || 5} hours/week

Return ONLY the JSON. No markdown fences, no explanation.`;

  try {
    const rawText = await callGemini(
      [{ role: 'user', parts: [{ text: prompt }] }],
      {
        temperature: 0.3,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      }
    );

    try {
      return JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    }
  } catch (err) {
    console.warn('Gemini learning path call encountered error, building curated path from catalog:', err.message);
  }

  // Fallback to high-quality curated roadmap from courses dataset
  return buildCuratedRoadmap(targetGoal, profile);
}

// ─── Skill gap analysis ───────────────────────────────────────────────────────
export async function analyzeSkillGaps(profile, goal) {
  const targetGoal = goal || (profile.goals || [])[0] || 'Technical Mastery';
  const prompt = `Analyze skill gaps for a learner wanting to achieve: "${targetGoal}"

Current State:
- Experience Level: ${profile.experienceLevel || 'beginner'}
- Known Skills: ${(profile.skills || []).map((s) => s.name).join(', ') || 'None'}
- Completed Courses: ${(profile.completedCourses || []).join(', ') || 'None'}

Return JSON:
{
  "gaps": [
    { "skill": "name", "priority": "high|medium|low", "reason": "why this skill is needed for the goal" }
  ],
  "strengths": ["existing strength to leverage"],
  "estimatedTimeToGoal": "X months"
}`;

  try {
    const rawText = await callGemini(
      [{ role: 'user', parts: [{ text: prompt }] }],
      {
        temperature: 0.2,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      }
    );
    return JSON.parse(rawText);
  } catch {
    return {
      gaps: [
        { skill: 'Core Fundamentals', priority: 'high', reason: 'Essential foundation for this career track' },
        { skill: 'Applied Hands-On Projects', priority: 'high', reason: 'Demonstrates real-world competence' },
        { skill: 'Advanced Best Practices & Testing', priority: 'medium', reason: 'Required for professional production environments' }
      ],
      strengths: profile.skills && profile.skills.length > 0 ? profile.skills.map((s) => s.name) : ['Curiosity and determination to learn'],
      estimatedTimeToGoal: '3-6 months'
    };
  }
}

// ─── Explain a single recommendation ─────────────────────────────────────────
export async function explainRecommendation(resource, profile) {
  const prompt = `In 3 sentences, explain to ${profile.name} (${profile.experienceLevel || 'beginner'} level) 
why "${resource.title}" is specifically recommended for them.

Their goal: ${(profile.goals || []).join(', ') || 'Professional Growth'}
Their interests: ${(profile.interests || []).join(', ') || 'Technology'}
Their learning style: ${profile.learningStyle || 'mixed'}

Be personal, specific, and encouraging. Avoid generic statements.`;

  try {
    const text = await callGemini(
      [{ role: 'user', parts: [{ text: prompt }] }],
      { temperature: 0.6, maxOutputTokens: 256 }
    );
    return text.trim();
  } catch {
    return `We recommended "${resource.title}" because it directly targets ${resource.skills?.join(', ') || 'core skills'} at your current ${profile.experienceLevel || 'beginner'} stage. It balances conceptual clarity with practical hands-on exercises tailored to your weekly schedule of ${profile.weeklyHours || 5} hours. Completing this will give you tangible progress toward your goals.`;
  }
}

// ─── Curated Fallback Roadmap Builder ──────────────────────────────────────────
function buildCuratedRoadmap(goal, profile) {
  const goalLower = goal.toLowerCase();
  
  // Find matching courses by domain / keywords
  let matchedCourses = courses.filter((c) => {
    return (
      goalLower.includes(c.domain.toLowerCase()) ||
      c.skills.some((s) => goalLower.includes(s.toLowerCase())) ||
      (profile.interests || []).some((i) => c.domain.toLowerCase().includes(i.toLowerCase()))
    );
  });

  if (matchedCourses.length < 4) {
    matchedCourses = courses.slice(0, 8);
  }

  const beginnerCourses = matchedCourses.filter((c) => c.level === 'beginner');
  const interCourses = matchedCourses.filter((c) => c.level === 'intermediate');
  const advCourses = matchedCourses.filter((c) => c.level === 'advanced');

  const phase1Courses = beginnerCourses.length ? beginnerCourses.slice(0, 3) : matchedCourses.slice(0, 3);
  const phase2Courses = interCourses.length ? interCourses.slice(0, 3) : matchedCourses.slice(2, 5);
  const phase3Courses = advCourses.length ? advCourses.slice(0, 2) : matchedCourses.slice(4, 7);

  const allSkills = [...new Set(matchedCourses.flatMap((c) => c.skills))].slice(0, 8);

  return {
    goal,
    totalDuration: '4-6 months',
    estimatedCompletion: '3-6 months from now',
    skillsToGain: allSkills,
    prerequisites: ['Basic computer literacy', 'Desire to learn'],
    phases: [
      {
        id: 'phase-1',
        title: 'Phase 1: Foundations & Core Essentials',
        description: `Build rock-solid foundational concepts tailored for ${profile.name}.`,
        order: 1,
        skills: allSkills.slice(0, 3),
        milestones: [
          {
            id: 'm-1-1',
            title: 'Milestone 1: Core Fundamentals Mastery',
            description: 'Master primary syntax, tools, and mental models.',
            resources: phase1Courses.slice(0, 2).map((c, i) => ({
              id: `r-1-1-${i + 1}`,
              title: c.title,
              type: 'course',
              url: c.url,
              duration: c.duration,
              difficulty: c.level,
              skills: c.skills.slice(0, 3),
              description: c.description,
              whyRecommended: `Matches your ${profile.experienceLevel || 'beginner'} baseline and introduces foundational concepts clearly before moving to complex material.`,
              completed: false,
            })),
          },
          {
            id: 'm-1-2',
            title: 'Milestone 2: First Hands-On Project',
            description: 'Apply what you have learned by building a real beginner-friendly project.',
            resources: [
              {
                id: 'r-1-2-1',
                title: 'Foundational Portfolio Project',
                type: 'project',
                url: 'https://github.com',
                duration: '10 hours',
                difficulty: 'beginner',
                skills: allSkills.slice(0, 2),
                description: 'Build and deploy a complete introductory project that solves a real problem.',
                whyRecommended: `Reinforces theory through active coding and gives you a tangible milestone to share.`,
                completed: false,
              },
            ],
          },
        ],
      },
      {
        id: 'phase-2',
        title: 'Phase 2: Intermediate Deep Dive & Integration',
        description: 'Level up your skills with modern frameworks, data integration, and architecture.',
        order: 2,
        skills: allSkills.slice(3, 6),
        milestones: [
          {
            id: 'm-2-1',
            title: 'Milestone 3: Advanced Concepts & Frameworks',
            description: 'Deepen understanding with industry-standard practices.',
            resources: phase2Courses.slice(0, 2).map((c, i) => ({
              id: `r-2-1-${i + 1}`,
              title: c.title,
              type: 'course',
              url: c.url,
              duration: c.duration,
              difficulty: c.level,
              skills: c.skills.slice(0, 3),
              description: c.description,
              whyRecommended: `Expands your abilities into industry-standard patterns, directly relevant to achieving "${goal}".`,
              completed: false,
            })),
          },
          {
            id: 'm-2-2',
            title: 'Milestone 4: Full-Stack / End-to-End Application',
            description: 'Connect databases, APIs, and client interfaces.',
            resources: [
              {
                id: 'r-2-2-1',
                title: 'Interactive Multi-Tier Project',
                type: 'project',
                url: 'https://github.com',
                duration: '15 hours',
                difficulty: 'intermediate',
                skills: allSkills.slice(2, 5),
                description: 'Build an end-to-end interactive application with full persistence and authentication.',
                whyRecommended: 'Essential for demonstrating professional competency and problem solving.',
                completed: false,
              },
            ],
          },
        ],
      },
      {
        id: 'phase-3',
        title: 'Phase 3: Production, Optimization & Mastery',
        description: 'Best practices, cloud deployment, performance optimization, and interview readiness.',
        order: 3,
        skills: allSkills.slice(5, 8),
        milestones: [
          {
            id: 'm-3-1',
            title: 'Milestone 5: Production Engineering & System Quality',
            description: 'Refactor for performance, security, and scalability.',
            resources: phase3Courses.slice(0, 2).map((c, i) => ({
              id: `r-3-1-${i + 1}`,
              title: c.title,
              type: 'course',
              url: c.url,
              duration: c.duration,
              difficulty: c.level,
              skills: c.skills.slice(0, 3),
              description: c.description,
              whyRecommended: `Prepares you to deliver clean, professional-grade code in team environments.`,
              completed: false,
            })),
          },
        ],
      },
    ],
  };
}

// ─── Fallback Chat Reply ──────────────────────────────────────────────────────
function buildFallbackChatReply(messages, profile) {
  const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
  
  if (lastMsg.includes('roadmap') || lastMsg.includes('path') || lastMsg.includes('generate')) {
    return `I would love to generate your customized learning roadmap right away! 🚀\n\nI have evaluated your profile (${profile.name}, ${profile.experienceLevel} level, targeting ${(profile.goals || []).join(', ') || 'Skill Mastery'}).\n\n[ACTION:GENERATE_ROADMAP]\n\nClick on the **Roadmap** tab or button to explore your step-by-step path with courses, projects, and milestones!`;
  }
  
  if (lastMsg.includes('goal') || lastMsg.includes('want to') || lastMsg.includes('learn')) {
    return `That is an excellent goal, ${profile.name}! 🎯\n\nBased on your interest and target weekly commitment of ${profile.weeklyHours || 5} hours, having a structured progression from fundamentals to real-world projects is key.\n\nWhenever you are ready, say **"Generate my roadmap"** or click the quick action below to create your personalized path!`;
  }

  return `Hello ${profile.name}! 👋 I'm your LearnAI personal advisor.\n\nTell me what you'd like to achieve, your primary interests, or how many hours a week you can commit. When you're ready, I'll generate a comprehensive learning path with courses, projects, and milestone checks!`;
}
