import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Notification {
  message: string;
  timeout?: number;
  type: 'success' | 'error' | 'info' | 'warn';
}

interface NotificationState extends Notification {
  id: string;
}

export interface State {
  notifications: NotificationState[];
  add: (notification: Notification) => void;
  remove: (id: NotificationState['id']) => void;
  clear: () => void;
}

export const notify = (
  message: string,
  type: Notification['type'] = 'info',
) => {
  useNotificationStore.getState().add({
    message,
    type,
  });
};

export const useNotificationStore = create<State>()(
  devtools(
    (set) => ({
      notifications: [],
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
