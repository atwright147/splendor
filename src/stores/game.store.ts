/* eslint-disable @typescript-eslint/ban-ts-comment */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import deckAll from '../../ref/cards.json';
import noblesAll from '../../ref/nobles.json';

import type { Card } from '../types/cards.type';
import type { Noble } from '../types/noble.type';
import { random } from 'radash';
import { TokenColorValues } from '../types/colors.type';
import { klona } from 'klona';
import { Uuid } from '../types/utils.types';

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

interface BoardState {
  cards: {
    level1: Card[],
    level2: Card[],
    level3: Card[],
  },
  tokens: {
    [color in TokenColorValues]: number
  },
  nobles: Noble[],
}

interface PlayerState {
  cards: {
    [color in TokenColorValues]: number;
  },
  nobles: Noble[],
  prestige: number,
  tokens: {
    [color in TokenColorValues]: number;
  },
}

export interface Store {
  board: BoardState,
  players: PlayerState[],
  DECK_ALL: Card[],
  NOBLES_ALL: Noble[],
  init: () => void,
  takeToken: (color: TokenColorValues, playerId: number) => void,
  buyCard: (id: Uuid, level: number, playerId: number) => void,
}

const initialBoardState: BoardState = {
  cards: {
    level1: [],
    level2: [],
    level3: [],
  },
  tokens: {
    gold: 0,
    black: 0,
    blue: 0,
    green: 0,
    red: 0,
    white: 0,
  },
  nobles: [],
}

const initialPlayerState: PlayerState = {
  cards: {
    gold: 0,
    black: 0,
    blue: 0,
    green: 0,
    red: 0,
    white: 0,
  },
  nobles: [],
  prestige: 0,
  tokens: {
    gold: 0,
    black: 0,
    blue: 0,
    green: 0,
    red: 0,
    white: 0,
  },
}

export const useGameStore = create<Store>()(
  devtools(
    (set, get) => ({
      board: initialBoardState,
      players: [initialPlayerState],
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

        const board: BoardState = {
          cards: {
            level1,
            level2,
            level3,
          },
          tokens: {
            gold: 5, // always 5 (I think?)
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
      takeToken: (color, playerId) => {
        if (get().board.tokens[color] > 0) {
          const players = klona(get().players);
          players[playerId].tokens[color] = players[playerId].tokens[color] + 1;

          const board = klona(get().board);
          board.tokens[color] = board.tokens[color] - 1;

          set({ players, board }, false, 'takeCard');
        }
      },
      buyCard: (id, level, playerId) => {
        const board = klona(get().board);
        const index = (board.cards[`level${level}`] as Card[]).findIndex((card) => card.id === id);
        const cardToMove = (board.cards[`level${level}`] as Card[]).splice(index, 1)[0];

        const allCardsOfLevel = get().DECK_ALL.filter((card) => card.level === level);
        const cardToAdd = allCardsOfLevel.splice(random(0, allCardsOfLevel.length - 1), 1)[0];
        (board.cards[`level${level}`] as Card[])[index] = cardToAdd;

        const players = klona(get().players);
        (players[playerId] as PlayerState).cards[cardToMove.gemColor] += 1;

        set({ board, players }, false, 'buyCard');
      }
    }),
    { enabled: true },
  ),
);
