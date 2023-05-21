import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Card } from '../types/cards.type';

type BoardState = {
  cards: {
    level1: {
      id: number;
      color: Color;
      points: number;
      cost: {
        [color in Color]?: number;
      };
    }[];
    level2: {
      id: number;
      color: Color;
      points: number;
      cost: {
        [color in Color]?: number;
      };
    }[];
    level3: {
      id: number;
      color: Color;
      points: number;
      cost: {
        [color in Color]?: number;
      };
    }[];
  };
  tokens: {
    [color in Color]: number;
  };
  nobles: Noble[];
};

type Color = 'white' | 'blue' | 'green' | 'red' | 'black';

type Noble = {
  id: number;
  requirement: {
    [color in Color]: number;
  };
  points: number;
};

type Player = {
  name: string;
  playTurn: (
    opponentsStates: PlayerState[],
    selfState: PlayerState,
    boardState: BoardState
  ) => Transaction;
};

type PlayerState = {
  tokens: {
    [color in Color]?: number;
  };
  cards: {
    id: number;
    color: Color;
    points: number;
    cost: {
      [color in Color]?: number;
    };
  }[];
  points: number;
  nobles: Noble[];
};

type Transaction =
  | {
      type: 'CARD_BUYING';
      cardId: number;
    }
  | {
      type: 'TOKENS_EXCHANGE';
      tokens: {
        [color in Color]: number;
      };
    };

export interface Store {
  board: number,
  increment: () => void,
  decrement: () => void,
}

const initialState: Board = {

}

export const useSpinnerStore = create<Store>()(
  devtools(
    (set, get) => ({
      board: ,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: get().count > 0 ? state.count - 1 : 0 })),
    }),
    { enabled: true },
  ),
);
