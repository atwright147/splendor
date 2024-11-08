import type { RequireExactlyOne } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

export interface Tokens {
  red?: number;
  green?: number;
  blue?: number;
  white?: number;
  black?: number;
  gold?: number;
}

type TokenColor = keyof Tokens;

type Token = RequireExactlyOne<Tokens>;

export interface Card {
  id: string;
  cost: Tokens;
  prestige: number;
  token: TokenColor;
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

interface GameState {
  players: PlayerState[];
  nobles: Noble[];
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

const createPlayer = (): PlayerState => ({
  uuid: uuidv4(),
  ...defaultPlayerState,
});

export const useGameStore = create<GameState>()(
  (set, get): GameState => ({
    players: [],
    nobles: [],
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
        nobles: state.nobles.filter((n) => n.id !== noble.id),
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
