import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuthStore, UserRole } from './useAuthStore';

export interface ChatFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Citation {
  id: string;
  title: string;
  source: string;
  url?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  liked?: boolean;
  disliked?: boolean;
  citations?: Citation[];
  files?: ChatFile[];
}

export interface ChatSession {
  id: string;
  title: string;
  role: UserRole;
  category: string;
  messages: Message[];
  pinned: boolean;
  archived: boolean;
  favorite: boolean;
  shared: boolean;
  createdAt: string;
  updatedAt: string;
  files: ChatFile[];
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: 'preference' | 'fact' | 'note' | 'topic';
  createdAt: string;
}

export interface LauraSettings {
  model: string;
  temperature: number;
  responseLength: 'concise' | 'balanced' | 'detailed';
  language: string;
  voice: 'female' | 'male';
  voiceSpeed: number;
  privacyMode: boolean;
  notificationsEnabled: boolean;
}

export interface AIInsight {
  dailySummary: string;
  weeklySummary: string;
  monthlySummary: string;
  productivityScore: number;
  learningAnalytics: { label: string; value: number }[];
  usageAnalytics: { date: string; queries: number }[];
}

interface LauraState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  settings: LauraSettings;
  memories: MemoryItem[];
  insights: AIInsight;
  isRecording: boolean;
  isPlayingSpeech: boolean;
  isGenerating: boolean;
  currentPlaybackMessageId: string | null;
  
  // Actions
  setSessions: (sessions: ChatSession[]) => void;
  setActiveSessionId: (id: string | null) => void;
  createSession: (role: UserRole, category?: string) => string;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => void;
  togglePinSession: (sessionId: string) => void;
  toggleArchiveSession: (sessionId: string) => void;
  toggleFavoriteSession: (sessionId: string) => void;
  toggleShareSession: (sessionId: string) => void;
  uploadFileToSession: (sessionId: string, file: ChatFile) => void;
  deleteFileFromSession: (sessionId: string, fileId: string) => void;
  
  // Settings Actions
  updateSettings: (updates: Partial<LauraSettings>) => void;
  
  // Memory Actions
  addMemory: (key: string, value: string, category: MemoryItem['category']) => void;
  deleteMemory: (id: string) => void;
  
  // Voice Actions
  setIsRecording: (recording: boolean) => void;
  setIsPlayingSpeech: (playing: boolean) => void;
  setCurrentPlaybackMessageId: (id: string | null) => void;
  
  // Generation Control
  setIsGenerating: (generating: boolean) => void;
}

export const useLauraStore = create<LauraState>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,
      isRecording: false,
      isPlayingSpeech: false,
      isGenerating: false,
      currentPlaybackMessageId: null,
      
      settings: {
        model: 'Gemini 3.5 Flash',
        temperature: 0.7,
        responseLength: 'balanced',
        language: 'English',
        voice: 'female',
        voiceSpeed: 1.0,
        privacyMode: false,
        notificationsEnabled: true,
      },
      
      memories: [
        { id: 'mem-1', key: 'Work Style', value: 'Prefers structured step-by-step math guides', category: 'preference', createdAt: new Date().toISOString() },
        { id: 'mem-2', key: 'Core Alert', value: 'Tommy Roberts has sensory processing sensitivities', category: 'fact', createdAt: new Date().toISOString() },
      ],
      
      insights: {
        dailySummary: 'Laura supported 4 lessons and helped resolve 2 parent communications today.',
        weeklySummary: 'This week saw a 15% increase in worksheet downloads and math practice quiz participation.',
        monthlySummary: 'Total student engagement reached 89% with fine-motor progress showing upward momentum.',
        productivityScore: 92,
        learningAnalytics: [
          { label: 'Speech & Language', value: 78 },
          { label: 'Task Completion', value: 85 },
          { label: 'Sensory Integration', value: 65 },
          { label: 'Social & Emotional', value: 90 },
        ],
        usageAnalytics: [
          { date: 'Mon', queries: 8 },
          { date: 'Tue', queries: 12 },
          { date: 'Wed', queries: 15 },
          { date: 'Thu', queries: 9 },
          { date: 'Fri', queries: 14 },
          { date: 'Sat', queries: 4 },
          { date: 'Sun', queries: 6 },
        ]
      },
      
      setSessions: (sessions) => set({ sessions }),
      
      setActiveSessionId: (activeSessionId) => set({ activeSessionId }),
      
      createSession: (role, category = 'General') => {
        const id = `session-${Date.now()}`;
        const newSession: ChatSession = {
          id,
          title: `New Session - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          role,
          category,
          messages: [],
          pinned: false,
          archived: false,
          favorite: false,
          shared: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          files: [],
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id,
        }));
        return id;
      },
      
      addMessage: (sessionId, message) => set((state) => {
        const updatedSessions = state.sessions.map((s) => {
          if (s.id === sessionId) {
            const newMsg: Message = {
              ...message,
              id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
            };
            
            // Auto rename session on first user message if default name is used
            let title = s.title;
            if (s.messages.length === 0 && message.role === 'user') {
              title = message.content.length > 30 ? message.content.substring(0, 30) + '...' : message.content;
            }
            
            return {
              ...s,
              title,
              messages: [...s.messages, newMsg],
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        });
        return { sessions: updatedSessions };
      }),
      
      updateMessage: (sessionId, messageId, updates) => set((state) => ({
        sessions: state.sessions.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: s.messages.map((m) => m.id === messageId ? { ...m, ...updates } : m),
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        }),
      })),
      
      deleteMessage: (sessionId, messageId) => set((state) => ({
        sessions: state.sessions.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: s.messages.filter((m) => m.id !== messageId),
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        }),
      })),
      
      renameSession: (sessionId, title) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, title, updatedAt: new Date().toISOString() } : s),
      })),
      
      deleteSession: (sessionId) => set((state) => {
        const remaining = state.sessions.filter((s) => s.id !== sessionId);
        const nextActive = state.activeSessionId === sessionId 
          ? (remaining.length > 0 ? remaining[0].id : null)
          : state.activeSessionId;
        return { sessions: remaining, activeSessionId: nextActive };
      }),
      
      togglePinSession: (sessionId) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, pinned: !s.pinned } : s),
      })),
      
      toggleArchiveSession: (sessionId) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, archived: !s.archived } : s),
      })),
      
      toggleFavoriteSession: (sessionId) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, favorite: !s.favorite } : s),
      })),
      
      toggleShareSession: (sessionId) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, shared: !s.shared } : s),
      })),
      
      uploadFileToSession: (sessionId, file) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, files: [...s.files, file], updatedAt: new Date().toISOString() } : s),
      })),
      
      deleteFileFromSession: (sessionId, fileId) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, files: s.files.filter((f) => f.id !== fileId), updatedAt: new Date().toISOString() } : s),
      })),
      
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates },
      })),
      
      addMemory: (key, value, category) => set((state) => ({
        memories: [
          ...state.memories,
          {
            id: `mem-${Date.now()}`,
            key,
            value,
            category,
            createdAt: new Date().toISOString(),
          }
        ]
      })),
      
      deleteMemory: (id) => set((state) => ({
        memories: state.memories.filter((m) => m.id !== id),
      })),
      
      setIsRecording: (isRecording) => set({ isRecording }),
      setIsPlayingSpeech: (isPlayingSpeech) => set({ isPlayingSpeech }),
      setCurrentPlaybackMessageId: (currentPlaybackMessageId) => set({ currentPlaybackMessageId }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
    }),
    {
      name: 'laura-ai-workspace-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const userId = useAuthStore.getState().user?.id || 'anonymous';
          return localStorage.getItem(`${name}-${userId}`);
        },
        setItem: (name, value) => {
          const userId = useAuthStore.getState().user?.id || 'anonymous';
          localStorage.setItem(`${name}-${userId}`, value);
        },
        removeItem: (name) => {
          const userId = useAuthStore.getState().user?.id || 'anonymous';
          localStorage.removeItem(`${name}-${userId}`);
        },
      })),
      partialize: (state) => ({ 
        sessions: state.sessions, 
        activeSessionId: state.activeSessionId, 
        settings: state.settings,
        memories: state.memories,
      }),
    }
  )
);
