import type { RequireExactlyOne } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import { random } from 'radash';
import deckAll from '../../ref/cards.json';
import noblesAll from '../../ref/nobles.json';

export interface Tokens {
  red?: number;
  green?: number;
  blue?: number;
  white?: number;
  black?: number;
  gold?: number;
}

export type TokenColor = keyof Tokens;

type Token = RequireExactlyOne<Tokens>;

export interface Card {
  id: string;
  cost: Tokens;
  prestige: number;
  token: TokenColor;
  level: number;
}

export interface Noble {
  id: string;
  cost: Tokens;
  prestige: number;
}

interface PlayerState {
  uuid: string;
  tokens: Tokens;
  cards: Card[];
  nobles: Noble[];
  reservedCards: Card[];
  prestige: number;
}

interface BoardState {
  cards: {
    level1: Card[];
    level2: Card[];
    level3: Card[];
  };
  tokens: {
    [color in TokenColor]: number;
  };
  nobles: Noble[];
}

interface GameState {
  board: BoardState;
  init: () => void;
  deal: () => void;
  deck: Card[];
  players: PlayerState[];
  currentPlayerIndex: number;
  setCurrentPlayerIndex: (index: number) => void;
  createPlayers: (quantity: number) => void;
  takeTokens: (tokens: Tokens) => void;
  takeCard: (card: Card) => void;
  reserveCard: (card: Card) => void;
  claimNoble: (noble: Noble) => void;
  nextPlayer: () => void;
}

const MAX_PLAYERS = 4;

const defaultPlayerState: PlayerState = {
  uuid: '',
  tokens: { red: 0, green: 0, blue: 0, white: 0, black: 0, gold: 0 },
  cards: [],
  nobles: [],
  reservedCards: [],
  prestige: 0,
};

const initialBoardState: BoardState = {
  cards: {
    level1: [],
    level2: [],
    level3: [],
  },
  tokens: {
    red: 0,
    green: 0,
    blue: 0,
    white: 0,
    black: 0,
    gold: 0,
  },
  nobles: [],
};

const createPlayer = (): PlayerState => ({
  uuid: uuidv4(),
  ...defaultPlayerState,
});

export const useGameStore = create<GameState>()(
  (set, get): GameState => ({
    board: initialBoardState,
    deck: [],
    init: () => {
      get().deck = deckAll as Card[];
      get().deal();
    },
    deal: () => {
      const allLevel1: Card[] = get().deck.filter((card) => card.level === 1);
      const allLevel2: Card[] = get().deck.filter((card) => card.level === 2);
      const allLevel3: Card[] = get().deck.filter((card) => card.level === 3);
      const level1: Card[] = [];
      const level2: Card[] = [];
      const level3: Card[] = [];

      for (let cardIndex = 1; cardIndex <= 4; cardIndex++) {
        const level1Card = allLevel1.splice(
          random(0, allLevel1.length - 1),
          1,
        )[0];
        const level2Card = allLevel2.splice(
          random(0, allLevel2.length - 1),
          1,
        )[0];
        const level3Card = allLevel3.splice(
          random(0, allLevel3.length - 1),
          1,
        )[0];

        level1.push(level1Card);
        level2.push(level2Card);
        level3.push(level3Card);

        get().deck.splice(
          get().deck.findIndex((card) => card.id === level1Card.id),
          1,
        );
        get().deck.splice(
          get().deck.findIndex((card) => card.id === level2Card.id),
          1,
        );
        get().deck.splice(
          get().deck.findIndex((card) => card.id === level3Card.id),
          1,
        );
      }

      const nobles: Noble[] = [];
      for (let nobleIndex = 0; nobleIndex < noblesAll.length; nobleIndex++) {
        nobles.push(
          ...(noblesAll as Noble[]).splice(random(0, noblesAll.length - 1), 1),
        );
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
      };
      set({ board, deck: deckAll as Card[] }, false);
    },
    players: [],
    currentPlayerIndex: 0,
    setCurrentPlayerIndex: (index) => set({ currentPlayerIndex: index }),
    createPlayers: (quantity) => {
      let qtyPlayersToCreate = quantity;
      if (qtyPlayersToCreate > MAX_PLAYERS) {
        qtyPlayersToCreate = MAX_PLAYERS;
        console.info(
          `Only ${MAX_PLAYERS} players can be created, ${quantity} requested.`,
        );
      }
      const players = Array.from({ length: qtyPlayersToCreate }, createPlayer);
      set({ players });
    },
    takeTokens: (tokens) => {
      set((state) => ({
        players: state.players.map((player, i) =>
          i === get().currentPlayerIndex ? { ...player, tokens } : player,
        ),
      }));
    },
    takeCard: (card) => {
      set((state) => ({
        players: state.players.map((player, i) =>
          i === get().currentPlayerIndex
            ? { ...player, cards: [...player.cards, card] }
            : player,
        ),
      }));
    },
    reserveCard: (card) => {
      const { reservedCards } = get().players[get().currentPlayerIndex];
      if (reservedCards.some((reservedCard) => reservedCard.id === card.id)) {
        console.warn('Card already reserved');
        return;
      }

      set((state) => ({
        players: state.players.map((player, i) =>
          i === get().currentPlayerIndex
            ? { ...player, reservedCards: [...player.reservedCards, card] }
            : player,
        ),
      }));
    },
    claimNoble: (noble) => {
      set((state) => ({
        players: state.players.map((player, i) =>
          i === get().currentPlayerIndex
            ? {
                ...player,
                prestige: player.prestige + noble.prestige,
                nobles: [...player.nobles, noble],
              }
            : player,
        ),
      }));
    },
    nextPlayer: () => {
      set((state) => ({
        currentPlayerIndex:
          (state.currentPlayerIndex + 1) % state.players.length,
      }));
    },
  }),
);
