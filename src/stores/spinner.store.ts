import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface State {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useSpinnerStore = create<State>()(
  devtools(
    (set, get) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: get().count > 0 ? state.count - 1 : 0 })),
    }),
    { enabled: true },
  ),
);
