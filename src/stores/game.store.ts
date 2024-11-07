import { create } from 'zustand';

export interface Tokens {
  red?: number;
  green?: number;
  blue?: number;
  white?: number;
  black?: number;
  gold?: number;
}

interface Card {
  id: string;
  cost: Tokens;
  prestige: number;
}

interface Noble {
  id: string;
  cost: Tokens;
  prestige: number;
}

interface PlayerState {
  tokens: Tokens;
  cards: Card[];
  reservedCards: Card[];
  prestige: number;
}

interface GameState {
  players: PlayerState[];
  nobles: Noble[];
  currentPlayerIndex: number;
  setTokens: (playerIndex: number, tokens: Tokens) => void;
  addCard: (playerIndex: number, card: Card) => void;
  reserveCard: (playerIndex: number, card: Card) => void;
  claimNoble: (playerIndex: number, noble: Noble) => void;
  nextPlayer: () => void;
}

export const useGameStore = create<GameState>()(
  (set, get): GameState => ({
    players: [
      {
        tokens: { red: 0, green: 0, blue: 0, white: 0, black: 0, gold: 0 },
        cards: [],
        reservedCards: [],
        prestige: 0,
      },
      {
        tokens: { red: 0, green: 0, blue: 0, white: 0, black: 0, gold: 0 },
        cards: [],
        reservedCards: [],
        prestige: 0,
      },
      {
        tokens: { red: 0, green: 0, blue: 0, white: 0, black: 0, gold: 0 },
        cards: [],
        reservedCards: [],
        prestige: 0,
      },
      {
        tokens: { red: 0, green: 0, blue: 0, white: 0, black: 0, gold: 0 },
        cards: [],
        reservedCards: [],
        prestige: 0,
      },
    ],
    nobles: [],
    currentPlayerIndex: 0,
    setTokens: (playerIndex, tokens) =>
      set((state) => ({
        players: state.players.map((player, i) =>
          i === playerIndex ? { ...player, tokens } : player,
        ),
      })),
    addCard: (playerIndex, card) =>
      set((state) => ({
        players: state.players.map((player, i) =>
          i === playerIndex
            ? { ...player, cards: [...player.cards, card] }
            : player,
        ),
      })),
    reserveCard: (playerIndex, card) =>
      set((state) => ({
        players: state.players.map((player, i) =>
          i === playerIndex
            ? { ...player, reservedCards: [...player.reservedCards, card] }
            : player,
        ),
      })),
    claimNoble: (playerIndex, noble) =>
      set((state) => ({
        players: state.players.map((player, i) =>
          i === playerIndex
            ? { ...player, prestige: player.prestige + noble.prestige }
            : player,
        ),
        nobles: state.nobles.filter((n) => n.id !== noble.id),
      })),
    nextPlayer: () =>
      set((state) => ({
        currentPlayerIndex:
          (state.currentPlayerIndex + 1) % state.players.length,
      })),
  }),
);
