import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ActionLogEntry {
  id: string;
  message: string;
  createdAt: number;
}

interface ActionLogState {
  entries: ActionLogEntry[];
  add: (message: string) => void;
  clear: () => void;
}

const MAX_ENTRIES = 120;

export const logAction = (message: string): void => {
  useActionLogStore.getState().add(message);
};

export const clearActionLog = (): void => {
  useActionLogStore.getState().clear();
};

export const useActionLogStore = create<ActionLogState>()(
  devtools(
    (set) => ({
      entries: [],
      add: (message) => {
        const entry: ActionLogEntry = {
          id: uuidv4(),
          message,
          createdAt: Date.now(),
        };

        set(
          (state) => {
            const nextEntries = [...state.entries, entry];
            return {
              entries: nextEntries.slice(-MAX_ENTRIES),
            };
          },
          false,
          'actionLog.add',
        );
      },
      clear: () => set({ entries: [] }, false, 'actionLog.clear'),
    }),
    { enabled: true, name: 'actionLog' },
  ),
);
