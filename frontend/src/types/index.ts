// Shared TypeScript types for the entire frontend

export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface LearnerProfile {
  userId: string;
  name: string;
  email?: string;
  interests: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  completedCourses: string[];
  learningStyle: 'visual' | 'reading' | 'project-based' | 'mixed';
  weeklyHours: number;
  skills: Skill[];
  conversationHistory: ConversationMessage[];
  streak: number;
  totalHoursLearned: number;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'course' | 'project' | 'quiz' | 'article' | 'video';
  url: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  description: string;
  whyRecommended: string;
  completed: boolean;
  completedAt?: string;
  rating?: number;
  feedback?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
  completed: boolean;
  completedAt?: string;
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  order: number;
  skills: string[];
  milestones: Milestone[];
}

export interface LearningPath {
  userId: string;
  goal: string;
  phases: Phase[];
  totalDuration: string;
  estimatedCompletion: string;
  skillsToGain: string[];
  prerequisites: string[];
  overallProgress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  domain: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  skills: string[];
  prerequisites: string[];
  provider: string;
  rating: number;
  url: string;
}

export interface ChatAction {
  type: 'GENERATE_ROADMAP' | 'UPDATE_PROFILE';
  data?: Record<string, unknown>;
}

export interface ChatResponse {
  reply: string;
  actions: ChatAction[];
  profile: LearnerProfile;
}

export interface AuthResponse {
  userId: string;
  profile: LearnerProfile;
  isNew: boolean;
}
