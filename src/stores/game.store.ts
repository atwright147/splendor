import type { RequireExactlyOne } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import { random } from 'radash';
import { devtools } from 'zustand/middleware';
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

export type Token = RequireExactlyOne<Tokens>;

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

export interface PlayerState {
  uuid: string;
  tokens: Tokens;
  cards: Card[];
  nobles: Noble[];
  prestige: number;
  reservedCards: Card[];
}

export interface BoardState {
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
  boardSnapshot: BoardState;
  setBoardSnapshot: () => void;
  resetBoardSnapshot: () => void;
  reservedTokens: Tokens;
  reservedCard: Card;
  commitTokens: () => void;
  init: () => void;
  deal: () => void;
  deck: Card[];
  players: PlayerState[];
  currentPlayerIndex: number;
  setCurrentPlayerIndex: (index: number) => void;
  createPlayers: (quantity: number) => void;
  reserveToken: (tokenColor: string) => void;
  canAffordCard: (card: Card) => boolean;
  removePlayerTokensByCardCost: (cardCost: Tokens) => Tokens;
  commitCard: (card: Card) => void;
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
  prestige: 0,
  reservedCards: [],
};

export const initialBoardState: BoardState = {
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
  ...defaultPlayerState,
  uuid: uuidv4(),
});

export const useGameStore = create<GameState>()(
  devtools(
    (set, get): GameState => ({
      board: { ...initialBoardState },
      boardSnapshot: { ...initialBoardState },
      setBoardSnapshot: () => set({ boardSnapshot: { ...get().board } }),
      resetBoardSnapshot: () =>
        set({ boardSnapshot: { ...initialBoardState } }),
      deck: [],
      reservedTokens: { ...initialBoardState.tokens },
      commitTokens: () => {
        set((state) => ({
          players: state.players.map((player, index) =>
            index === get().currentPlayerIndex
              ? {
                  ...player,
                  tokens: { ...player.tokens, ...get().reservedTokens },
                }
              : player,
          ),
        }));
      },
      init: () => {
        const deckAllCopy = [...deckAll] as Card[];
        get().deck = deckAllCopy;
        // get().deal();
        // get().setBoardSnapshot();
      },
      deal: () => {
        if (get().players.length === 0) {
          console.warn('Players not created');
          return;
        }

        let qtyTokens = 0;
        let qtyNobles = 0;

        switch (get().players.length) {
          case 2:
            qtyTokens = 4;
            qtyNobles = 3;
            break;

          case 3:
            qtyTokens = 5;
            qtyNobles = 4;
            break;

          case 4:
            qtyTokens = 7;
            qtyNobles = 5;
            break;

          default:
            break;
        }

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
          // console.log(level3Card);
          get().deck.splice(
            get().deck.findIndex((card) => card.id === level3Card.id),
            1,
          );
        }

        const noblesAllCopy = [...noblesAll];
        const nobles: Noble[] = [];
        for (let nobleIndex = 1; nobleIndex <= qtyNobles; nobleIndex++) {
          nobles.push(
            ...noblesAllCopy.splice(random(0, noblesAllCopy.length - 1), 1),
          );
        }

        const board: BoardState = {
          cards: {
            level1,
            level2,
            level3,
          },
          tokens: {
            gold: 5, // always 5
            black: qtyTokens,
            blue: qtyTokens,
            green: qtyTokens,
            red: qtyTokens,
            white: qtyTokens,
          },
          nobles,
        };
        set({ board }, false);
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
        const players = Array.from(
          { length: qtyPlayersToCreate },
          createPlayer,
        );
        set({ players });
      },
      reserveToken: (tokenColor: TokenColor) => {
        const { reservedTokens, board, boardSnapshot } = get();

        // Don't allow taking gold tokens directly
        if (tokenColor === 'gold') {
          console.info('Gold tokens cannot be taken directly');
          return;
        }

        // Get total number of tokens currently reserved
        const totalReservedTokens = Object.values(reservedTokens).reduce(
          (sum, count) => sum + count,
          0,
        );

        // Get number of tokens of this color already reserved
        const currentColorCount = reservedTokens[tokenColor] || 0;

        // Get number of tokens available at the start of the turn
        const availableTokens = boardSnapshot.tokens[tokenColor];

        // Rule 1: Cannot reserve two of the same color if a different color is already reserved
        const differentColorTokens = Object.entries(reservedTokens).filter(
          ([color, count]) => color !== tokenColor && count > 0,
        );
        if (differentColorTokens.length > 0 && currentColorCount >= 1) {
          console.info(
            'Cannot reserve two of the same color when a different color is already reserved',
          );
          return;
        }

        // Rule 2: Taking 2 tokens of the same color
        if (currentColorCount === 1) {
          // Can only take 2 if there were at least 4 available at start of turn
          if (availableTokens < 4) {
            console.info(
              'Cannot take 2 tokens of the same color unless 4 or more were available at start of turn',
            );
            return;
          }
          // Can't take more than 2 of the same color
          if (currentColorCount >= 2) {
            console.info('Cannot take more than 2 tokens of the same color');
            return;
          }
        }

        // Rule 3: Taking 3 different colored tokens
        else if (currentColorCount === 0) {
          // Check if player is trying to take a different colored token
          if (differentColorTokens.length >= 3) {
            console.info('Cannot take more than 3 different colored tokens');
            return;
          }
          // Ensure not taking 2 of any color when taking different colors
          if (differentColorTokens.some(([_, count]) => count >= 2)) {
            console.info('Cannot mix taking 2 of one color with other colors');
            return;
          }
        }

        // Rule 4: Check if there are any tokens of this color left to take
        if (board.tokens[tokenColor] <= 0) {
          console.info('No tokens of this color remaining');
          return;
        }

        // Rule 5: Players can't hold more than 10 tokens total
        const playerCurrentTokens = Object.values(
          get().players[get().currentPlayerIndex].tokens,
        ).reduce((sum, count) => sum + count, 0);
        if (playerCurrentTokens + totalReservedTokens + 1 > 10) {
          console.info('Cannot hold more than 10 tokens total');
          return;
        }

        // If all checks pass, reserve the token
        set((state) => ({
          reservedTokens: {
            ...state.reservedTokens,
            [tokenColor]: state.reservedTokens[tokenColor] + 1,
          },
          board: {
            ...state.board,
            tokens: {
              ...state.board.tokens,
              [tokenColor]: state.board.tokens[tokenColor] - 1,
            },
          },
        }));
      },
      canAffordCard: (card) => {
        const player = get().players[get().currentPlayerIndex];

        const canAffordWithTokens = Object.entries(card.cost).every(
          ([color, qty]) => player.tokens[color] >= qty,
        );

        if (!canAffordWithTokens) {
          const requiredTokens = Object.entries(card.cost).reduce(
            (sum, [color, qty]) => sum + qty,
            0,
          );

          // count how many tokens the player has that match the cost of the card
          const matchingTokens = Object.entries(player.tokens).reduce(
            (sum, [color, qty]): number => {
              if (card.cost[color]) {
                return sum + qty;
              }
              return sum;
            },
            0,
          );

          return matchingTokens + player.tokens.gold >= requiredTokens;
        }

        return true;
      },
      removePlayerTokensByCardCost: (cardCost) => {
        const player = get().players[get().currentPlayerIndex];
        const newTokens = { ...player.tokens };

        for (const [color, qty] of Object.entries(cardCost)) {
          newTokens[color] -= qty;
        }

        return newTokens;
      },
      commitCard: (card) => {
        if (!get().canAffordCard(card)) {
          console.warn('Cannot afford card');
          return;
        }

        set((state) => ({
          players: state.players.map((player, i) =>
            i === get().currentPlayerIndex
              ? {
                  ...player,
                  cards: [...player.cards, card],
                  prestige: player.prestige + card.prestige,
                  tokens: get().removePlayerTokensByCardCost(card.cost),
                }
              : player,
          ),
        }));
      },
      reserveCard: (card) => {
        set({ reservedCard: card });
      },
      // reserveCard: (card) => {
      //   const { reservedCards } = get().players[get().currentPlayerIndex];
      //   if (reservedCards.some((reservedCard) => reservedCard.id === card.id)) {
      //     console.warn('Card already reserved');
      //     return;
      //   }

      //   const randomCard = get().deck[random(0, get().deck.length - 1)];
      //   const level = card.level;
      //   const cardLevelKey = `level${level}`;
      //   const cardsOfSameLevel: Card[] = get().board.cards[cardLevelKey];
      //   const index = cardsOfSameLevel.indexOf(card);
      //   const newCards = [...cardsOfSameLevel];
      //   newCards.splice(index, 1, randomCard);

      //   set((state) => ({
      //     players: state.players.map((player, i) =>
      //       i === get().currentPlayerIndex
      //         ? { ...player, reservedCards: [...player.reservedCards, card] }
      //         : player,
      //     ),
      //     deck: get().deck.filter((deckCard) => deckCard.id !== randomCard.id),
      //     board: {
      //       ...state.board,
      //       cards: {
      //         ...state.board.cards,
      //         [cardLevelKey]: newCards,
      //       },
      //     },
      //   }));
      // },
      reservedCard: null,
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
          board: {
            ...state.board,
            nobles: state.board.nobles.filter((n) => n.id !== noble.id),
          },
        }));
      },
      nextPlayer: () => {
        set((state) => ({
          // TODO: commit reserved items etc
          boardSnapshot: state.board,
          currentPlayerIndex:
            (state.currentPlayerIndex + 1) % state.players.length,
        }));
      },
    }),
  ),
);
