import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearnerProfile, LearningPath, ConversationMessage } from '../types';

interface ChatMessage extends ConversationMessage {
  id: string;
  timestamp: string;
  isLoading?: boolean;
}

interface AppState {
  // Auth
  userId: string | null;
  isNew: boolean;
  setUser: (userId: string, isNew: boolean) => void;
  logout: () => void;

  // Profile
  profile: LearnerProfile | null;
  setProfile: (profile: LearnerProfile) => void;
  updateProfileField: <K extends keyof LearnerProfile>(key: K, value: LearnerProfile[K]) => void;

  // Chat
  messages: ChatMessage[];
  isChatLoading: boolean;
  addMessage: (msg: Omit<ChatMessage, 'id'>) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setChatLoading: (v: boolean) => void;

  // Roadmap
  roadmap: LearningPath | null;
  isGenerating: boolean;
  setRoadmap: (roadmap: LearningPath | null) => void;
  setGenerating: (v: boolean) => void;
}

let msgCounter = 0;

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // ── Auth ──────────────────────────────────────────────────────────
      userId: null,
      isNew: false,
      setUser: (userId, isNew) => set({ userId, isNew }),
      logout: () =>
        set({ userId: null, profile: null, messages: [], roadmap: null, isNew: false }),

      // ── Profile ───────────────────────────────────────────────────────
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfileField: (key, value) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, [key]: value } : null,
        })),

      // ── Chat ──────────────────────────────────────────────────────────
      messages: [],
      isChatLoading: false,
      addMessage: (msg) => {
        const id = `msg-${++msgCounter}-${Date.now()}`;
        set((state) => ({ messages: [...state.messages, { ...msg, id }] }));
        return id;
      },
      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
      removeMessage: (id) =>
        set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),
      clearMessages: () => set({ messages: [] }),
      setChatLoading: (v) => set({ isChatLoading: v }),

      // ── Roadmap ───────────────────────────────────────────────────────
      roadmap: null,
      isGenerating: false,
      setRoadmap: (roadmap) => set({ roadmap }),
      setGenerating: (v) => set({ isGenerating: v }),
    }),
    {
      name: 'learnai-storage',
      partialize: (state) => ({
        userId: state.userId,
        isNew: state.isNew,
        profile: state.profile,
        roadmap: state.roadmap,
        messages: state.messages.slice(-30), // persist last 30 messages
      }),
    }
  )
);
