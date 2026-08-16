import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

export type Audience = "everyone" | "students" | "parents" | "teachers" | "therapists";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: Audience;
  pinned: boolean;
  createdAt: string;
}

interface AnnouncementStore {
  announcements: Announcement[];
  addAnnouncement: (announcement: Announcement) => void;
  togglePin: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
}

export const useAnnouncementStore = create<AnnouncementStore>()(
  persist(
    (set) => ({
      announcements: [
        {
          id: "1",
          title: "Welcome to the new semester!",
          message: "We are excited to begin this semester. Please ensure all students have their materials ready.",
          audience: "everyone",
          pinned: true,
          createdAt: new Date().toISOString(),
        }
      ],
      addAnnouncement: (announcement) =>
        set((state) => ({
          announcements: [announcement, ...state.announcements],
        })),
      togglePin: (id) =>
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, pinned: !a.pinned } : a
          ),
        })),
      deleteAnnouncement: (id) =>
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        })),
    }),
    {
      name: 'learnbeyond-announcements',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          return localStorage.getItem(name);
        },
        setItem: (name, value) => {
          localStorage.setItem(name, value);
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      })),
    }
  )
);
