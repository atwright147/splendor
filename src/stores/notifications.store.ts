import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Notification {
  id: string;
  message: string;
  timeout?: number;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface State {
  notifications: Notification[];
  add: (notification: Notification) => void;
  remove: (id: Notification['id']) => void;
  clear: () => void;
}

export const useNotificationStore = create<State>()(
  devtools(
    (set, get) => ({
      notifications: [
        {
          id: uuidv4(),
          message: 'Welcome to Splendor',
          type: 'info' as Notification['type'],
        },
        {
          id: uuidv4(),
          message: 'Click on a card to play it',
          type: 'success' as Notification['type'],
        },
      ],
      add: (newNotification) => {
        const notification = {
          ...newNotification,
          id: uuidv4(),
        };

        set((state) => ({
          notifications: [...state.notifications, notification],
        }));
      },
      remove: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clear: () => set({ notifications: [] }),
    }),
    { enabled: true, name: 'notifications' },
  ),
);
