import axios from 'axios';
import type {
  AuthResponse,
  LearnerProfile,
  LearningPath,
  ChatResponse,
  ConversationMessage,
  Course,
  Resource,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s for AI calls
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (name: string, email?: string) =>
  api.post<AuthResponse>('/auth/login', { name, email }).then((r) => r.data);

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile = (userId: string) =>
  api.get<{ profile: LearnerProfile }>(`/profile/${userId}`).then((r) => r.data.profile);

export const updateProfile = (userId: string, updates: Partial<LearnerProfile>) =>
  api.put<{ profile: LearnerProfile }>(`/profile/${userId}`, updates).then((r) => r.data.profile);

export const addSkill = (userId: string, name: string, level: number) =>
  api
    .post<{ profile: LearnerProfile }>(`/profile/${userId}/skill`, { name, level })
    .then((r) => r.data.profile);

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const sendChat = (userId: string, message: string, history: ConversationMessage[]) =>
  api
    .post<ChatResponse>('/chat', { userId, message, conversationHistory: history })
    .then((r) => r.data);

export const clearChatHistory = (userId: string) =>
  api.delete(`/chat/${userId}/history`).then((r) => r.data);

// ─── Roadmap ──────────────────────────────────────────────────────────────────
export const generateRoadmap = (userId: string, goal?: string) =>
  api
    .post<{ roadmap: LearningPath }>('/roadmap/generate', { userId, goal })
    .then((r) => r.data.roadmap);

export const getRoadmap = (userId: string) =>
  api.get<{ roadmap: LearningPath | null }>(`/roadmap/${userId}`).then((r) => r.data.roadmap);

export const updateProgress = (
  userId: string,
  phaseId: string,
  milestoneId: string,
  resourceId: string,
  completed: boolean
) =>
  api
    .put<{ roadmap: LearningPath }>(`/roadmap/${userId}/progress`, {
      phaseId,
      milestoneId,
      resourceId,
      completed,
    })
    .then((r) => r.data.roadmap);

export const submitFeedback = (
  userId: string,
  phaseId: string,
  milestoneId: string,
  resourceId: string,
  rating: number,
  feedback?: string
) =>
  api
    .post(`/roadmap/${userId}/feedback`, { phaseId, milestoneId, resourceId, rating, feedback })
    .then((r) => r.data);

export const explainResource = (userId: string, resource: Resource) =>
  api
    .post<{ explanation: string }>('/roadmap/explain', { userId, resource })
    .then((r) => r.data.explanation);

// ─── Courses ──────────────────────────────────────────────────────────────────
export const getCourses = (params?: { domain?: string; level?: string; search?: string }) =>
  api
    .get<{ courses: Course[]; total: number; domains: string[] }>('/courses', { params })
    .then((r) => r.data);

export default api;
