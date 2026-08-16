import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

export interface RewardItem {
  id: string;
  name: string;
  cost: number;
  type: 'theme' | 'frame' | 'avatar';
  unlocked: boolean;
  previewUrl: string;
}

export interface LearningGoal {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: 'academic' | 'personal';
  target: number;
  current: number;
  completed: boolean;
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'academic' | 'attendance' | 'consistency' | 'excellence' | 'participation';
}

export interface LessonAnnotation {
  lessonId: string;
  notes: string;
  bookmarks: boolean;
  highlights: { id: string; text: string; color: string }[];
  whiteboardData?: string; // canvas drawings base64
}

interface LearningState {
  xp: number;
  level: number;
  streak: number;
  coins: number;
  dailyGoalProgress: number;
  lastLoginDate: string;
  recentActivity: { id: string; title: string; type: string; timestamp: string; score?: number }[];
  goals: LearningGoal[];
  badges: BadgeItem[];
  rewards: RewardItem[];
  annotations: Record<string, LessonAnnotation>;
  completedLessons: string[];
  recentlyViewed: string[];

  // Actions
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  checkDailyLogin: () => void;
  completeLesson: (lessonId: string) => void;
  viewLesson: (lessonId: string) => void;
  logActivity: (title: string, type: string, score?: number) => void;
  
  // Goal Actions
  addGoal: (title: string, type: LearningGoal['type'], category: LearningGoal['category'], target: number) => void;
  updateGoalProgress: (goalId: string, amount: number) => void;
  deleteGoal: (goalId: string) => void;

  // Reward actions
  purchaseReward: (rewardId: string) => boolean;

  // Badge actions
  unlockBadge: (badgeId: string) => void;

  // Annotations (Lesson Viewer)
  updateNotes: (lessonId: string, notes: string) => void;
  toggleBookmark: (lessonId: string) => void;
  addHighlight: (lessonId: string, text: string, color: string) => void;
  removeHighlight: (lessonId: string, highlightId: string) => void;
  updateWhiteboard: (lessonId: string, whiteboardData: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 1,
      coins: 0,
      dailyGoalProgress: 0,
      lastLoginDate: new Date().toISOString().split('T')[0],
      recentActivity: [],
      recentlyViewed: [],
      completedLessons: [],
      goals: [],
      badges: [
        { id: 'badge-1', name: 'Consistency Champ', description: 'Maintain a 5-day learning streak', icon: '🔥', unlocked: false, category: 'consistency' },
        { id: 'badge-2', name: 'Academic Ace', description: 'Score 90% or higher in any quiz', icon: '🏆', unlocked: false, category: 'excellence' },
        { id: 'badge-3', name: 'Science Wiz', description: 'Complete all Biology modules', icon: '🧪', unlocked: false, category: 'academic' },
        { id: 'badge-4', name: 'Attendance Star', description: 'Attend all classes in a week', icon: '📅', unlocked: false, category: 'attendance' },
      ],
      rewards: [
        { id: 'rew-1', name: 'Cyber Neon Theme', cost: 100, type: 'theme', unlocked: false, previewUrl: 'neon' },
        { id: 'rew-2', name: 'Golden Champion Frame', cost: 150, type: 'frame', unlocked: false, previewUrl: 'gold' },
        { id: 'rew-3', name: 'Astronaut Avatar Set', cost: 200, type: 'avatar', unlocked: false, previewUrl: 'astronaut' },
      ],
      annotations: {},

      addXp: (amount) => set((state) => {
        const nextXp = state.xp + amount;
        const requiredXp = state.level * 500;
        let nextLevel = state.level;
        if (nextXp >= requiredXp) {
          nextLevel += 1;
        }
        return { xp: nextXp, level: nextLevel };
      }),

      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

      checkDailyLogin: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        if (state.lastLoginDate === today) return {}; // Already logged in today

        const lastLogin = new Date(state.lastLoginDate);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate.getTime() - lastLogin.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let newStreak = state.streak;
        if (diffDays === 1) {
          // Logged in exactly the next day, increment streak
          newStreak += 1;
        } else if (diffDays > 1) {
          // Missed a day, reset streak
          newStreak = 1;
        }

        return { streak: newStreak, lastLoginDate: today, dailyGoalProgress: 0 };
      }),

      completeLesson: (lessonId) => set((state) => {
        if (state.completedLessons.includes(lessonId)) return {};
        const updatedCompleted = [...state.completedLessons, lessonId];
        // Trigger rewards/XP on completion
        const xpGained = 150;
        const coinsGained = 25;
        const nextXp = state.xp + xpGained;
        const requiredXp = state.level * 500;
        let nextLevel = state.level;
        if (nextXp >= requiredXp) nextLevel += 1;

        return {
          completedLessons: updatedCompleted,
          xp: nextXp,
          level: nextLevel,
          coins: state.coins + coinsGained,
        };
      }),

      viewLesson: (lessonId) => set((state) => {
        const remaining = state.recentlyViewed.filter(id => id !== lessonId);
        return { recentlyViewed: [lessonId, ...remaining].slice(0, 5) };
      }),

      logActivity: (title, type, score) => set((state) => ({
        recentActivity: [
          { id: `act-${Date.now()}`, title, type, timestamp: new Date().toISOString(), score },
          ...state.recentActivity
        ].slice(0, 10)
      })),

      addGoal: (title, type, category, target) => set((state) => ({
        goals: [
          ...state.goals,
          { id: `goal-${Date.now()}`, title, type, category, target, current: 0, completed: false }
        ]
      })),

      updateGoalProgress: (goalId, amount) => set((state) => ({
        goals: state.goals.map(g => {
          if (g.id === goalId) {
            const nextVal = Math.min(g.target, g.current + amount);
            const completed = nextVal >= g.target;
            if (completed && !g.completed) {
              // Gained reward
              setTimeout(() => {
                get().addXp(100);
                get().addCoins(20);
              }, 0);
            }
            return { ...g, current: nextVal, completed };
          }
          return g;
        })
      })),

      deleteGoal: (goalId) => set((state) => ({
        goals: state.goals.filter(g => g.id !== goalId)
      })),

      purchaseReward: (rewardId) => {
        const state = get();
        const reward = state.rewards.find(r => r.id === rewardId);
        if (!reward || reward.unlocked || state.coins < reward.cost) return false;
        
        set((state) => ({
          coins: state.coins - reward.cost,
          rewards: state.rewards.map(r => r.id === rewardId ? { ...r, unlocked: true } : r)
        }));
        return true;
      },

      unlockBadge: (badgeId) => set((state) => ({
        badges: state.badges.map(b => b.id === badgeId ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() } : b)
      })),

      updateNotes: (lessonId, notes) => set((state) => {
        const currentAnnotation = state.annotations[lessonId] || { lessonId, notes: '', bookmarks: false, highlights: [] };
        return {
          annotations: {
            ...state.annotations,
            [lessonId]: { ...currentAnnotation, notes }
          }
        };
      }),

      toggleBookmark: (lessonId) => set((state) => {
        const currentAnnotation = state.annotations[lessonId] || { lessonId, notes: '', bookmarks: false, highlights: [] };
        return {
          annotations: {
            ...state.annotations,
            [lessonId]: { ...currentAnnotation, bookmarks: !currentAnnotation.bookmarks }
          }
        };
      }),

      addHighlight: (lessonId, text, color) => set((state) => {
        const currentAnnotation = state.annotations[lessonId] || { lessonId, notes: '', bookmarks: false, highlights: [] };
        const newHighlight = { id: `hl-${Date.now()}`, text, color };
        return {
          annotations: {
            ...state.annotations,
            [lessonId]: {
              ...currentAnnotation,
              highlights: [...currentAnnotation.highlights, newHighlight]
            }
          }
        };
      }),

      removeHighlight: (lessonId, highlightId) => set((state) => {
        const currentAnnotation = state.annotations[lessonId] || { lessonId, notes: '', bookmarks: false, highlights: [] };
        return {
          annotations: {
            ...state.annotations,
            [lessonId]: {
              ...currentAnnotation,
              highlights: currentAnnotation.highlights.filter(h => h.id !== highlightId)
            }
          }
        };
      }),

      updateWhiteboard: (lessonId, whiteboardData) => set((state) => {
        const currentAnnotation = state.annotations[lessonId] || { lessonId, notes: '', bookmarks: false, highlights: [] };
        return {
          annotations: {
            ...state.annotations,
            [lessonId]: { ...currentAnnotation, whiteboardData }
          }
        };
      }),
    }),
    {
      name: 'learnbeyond-learning-system-store',
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
    }
  )
);
