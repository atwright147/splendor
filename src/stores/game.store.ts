/* eslint-disable @typescript-eslint/ban-ts-comment */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import deckAll from '../../ref/cards.json';
import noblesAll from '../../ref/nobles.json';

import type { Card } from '../types/cards.type';
import type { Noble } from '../types/noble.type';
import { random } from 'radash';
import { ColorKeys } from '../types/colors.type';

// type BoardState = {
//   cards: {
//     level1: {
//       id: number;
//       color: Color;
//       points: number;
//       cost: {
//         [color in Color]?: number;
//       };
//     }[];
//     level2: {
//       id: number;
//       color: Color;
//       points: number;
//       cost: {
//         [color in Color]?: number;
//       };
//     }[];
//     level3: {
//       id: number;
//       color: Color;
//       points: number;
//       cost: {
//         [color in Color]?: number;
//       };
//     }[];
//   };
//   tokens: {
//     [color in Color]: number;
//   };
//   nobles: Noble[];
// };

// type Color = 'white' | 'blue' | 'green' | 'red' | 'black';

// type Noble = {
//   id: number;
//   requirement: {
//     [color in Color]: number;
//   };
//   points: number;
// };

// type Player = {
//   name: string;
//   playTurn: (
//     opponentsStates: PlayerState[],
//     selfState: PlayerState,
//     boardState: BoardState
//   ) => Transaction;
// };

// type PlayerState = {
//   tokens: {
//     [color in Color]?: number;
//   };
//   cards: {
//     id: number;
//     color: Color;
//     points: number;
//     cost: {
//       [color in Color]?: number;
//     };
//   }[];
//   points: number;
//   nobles: Noble[];
// };

// type Transaction =
//   | {
//       type: 'CARD_BUYING';
//       cardId: number;
//     }
//   | {
//       type: 'TOKENS_EXCHANGE';
//       tokens: {
//         [color in Color]: number;
//       };
//     };

interface Board {
  cards: {
    level1: Card[],
    level2: Card[],
    level3: Card[],
  },
  tokens: {
    [color in ColorKeys]: number
  },
  nobles: Noble[],
}

export interface Store {
  board: Board,
  DECK_ALL: Card[],
  NOBLES_ALL: Noble[],
  init: () => void,
  // increment: () => void,
  // decrement: () => void,
}

const initialBoardState: Board = {
  cards: {
    level1: [],
    level2: [],
    level3: [],
  },
  tokens: {
    black: 0,
    blue: 0,
    green: 0,
    red: 0,
    white: 0,
  },
  nobles: [],
}

export const useGameStore = create<Store>()(
  devtools(
    (set, get) => ({
      board: initialBoardState,
      // @ts-ignore
      DECK_ALL: deckAll,
      // @ts-ignore
      NOBLES_ALL: noblesAll,
      init: () => {
        const allNobles: Noble[] = get().NOBLES_ALL;
        const allLevel1: Card[] = get().DECK_ALL.filter((card) => card.level === 1);
        const allLevel2: Card[] = get().DECK_ALL.filter((card) => card.level === 2);
        const allLevel3: Card[] = get().DECK_ALL.filter((card) => card.level === 3);
        const level1: Card[] = [];
        const level2: Card[] = [];
        const level3: Card[] = [];

        for (let cardIndex = 1; cardIndex <= 4; cardIndex++) {
          level1.push(...allLevel1.splice(random(0, allLevel1.length - 1), 1))
          level2.push(...allLevel2.splice(random(0, allLevel2.length - 1), 1))
          level3.push(...allLevel3.splice(random(0, allLevel3.length - 1), 1))
        }

        const nobles: Noble[] = [];
        for (let nobleIndex = 0; nobleIndex < allNobles.length; nobleIndex++) {
          nobles.push(...allNobles.splice(random(0, allNobles.length - 1), 1))
        }

        const board: Board = {
          cards: {
            level1,
            level2,
            level3,
          },
          tokens: {
            black: 4,
            blue: 4,
            green: 4,
            red: 4,
            white: 4,
          },
          nobles,
        }
        set({ board }, false, 'init')
      },
      // increment: () => set((state) => ({ count: state.count + 1 })),
      // decrement: () => set((state) => ({ count: get().count > 0 ? state.count - 1 : 0 })),
    }),
    { enabled: true },
  ),
);
