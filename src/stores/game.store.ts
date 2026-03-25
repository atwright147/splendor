import { random } from 'radash';
import type { RequireExactlyOne } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import deckAll from '#ref/cards.json';
import noblesAll from '#ref/nobles.json';
import { notify } from '#stores/notifications.store';
import { addGem } from '#utils/addGem';
import { mergeTokens } from '#utils/mergeTokens';

export interface Gems {
  red: number;
  green: number;
  blue: number;
  white: number;
  black: number;
}

type Cost = Gems;

export type GemColors = keyof Gems;

export type Gem = RequireExactlyOne<Gems>;

export interface Tokens {
  red: number;
  green: number;
  blue: number;
  white: number;
  black: number;
  gold: number;
}

export type TokenColors = keyof Tokens;

export type Token = RequireExactlyOne<Tokens>;

export interface Card {
  id: string;
  cost: Cost;
  prestige: number;
  gem: GemColors;
  level: number;
}

export interface Noble {
  id: string;
  cost: Cost;
  prestige: number;
}

export interface PlayerState {
  uuid: string;
  tokens: Tokens;
  cards: Card[];
  gems: Gems;
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
    [color in TokenColors]: number;
  };
  nobles: Noble[];
}

interface PickedCard {
  card: Card;
  boardIndex: number;
  intent: 'buy' | 'reserve';
}

interface GameState {
  board: BoardState;
  boardSnapshot: BoardState;
  pickedCard: PickedCard | null;
  pickedTokens: Gems;
  deck: Card[];
  players: PlayerState[];
  currentPlayerIndex: number;
  isGameOver: boolean;
  winner: PlayerState | null;
  tiedPlayers: PlayerState[];
  finalRoundTriggered: boolean;
  finalRoundPlayer: number | null;
  needToReturnTokens: boolean;
  tokensToReturn: number;

  setBoardSnapshot: () => void;
  resetBoardSnapshot: () => void;
  commitTokens: () => void;
  reset: () => void;
  init: () => void;
  deal: () => void;
  setCurrentPlayerIndex: (index: number) => void;
  getCurrentPlayer: () => PlayerState;
  getNextPlayerIndex: () => number | undefined;
  getPlayerById: (uuid: string) => PlayerState | undefined;
  getPlayerByIndex: (index: number) => PlayerState | undefined;
  createPlayers: (quantity: number) => void;
  pickToken: (tokenColor: TokenColors) => void;
  returnToken: (tokenColor: TokenColors) => void;
  canAffordCard: (card: Card) => boolean;
  canAffordNoble: (noble: Noble) => boolean;
  getAffordableNobles: () => Noble[];
  hasAffordableNobles: () => boolean;
  removePlayerTokensByCardCost: (cardCost: Gems) => Tokens;
  commitCard: (reservedCardIndex?: number) => boolean;
  pickCard: (card: Card) => void;
  setPickedCardIntent: (intent: 'buy' | 'reserve') => void;
  reserveFromDeck: (level: 1 | 2 | 3) => void;
  claimNoble: (noble: Noble) => void;
  nextPlayer: () => void;
  canEndTurn: () => boolean;
  isForcedPass: () => boolean;
  checkWinCondition: () => void;
  finishTurn: () => void;
  endTurn: () => void;
}

const MAX_PLAYERS = 4;

const defaultTokens: Tokens = {
  red: 0,
  green: 0,
  blue: 0,
  white: 0,
  black: 0,
  gold: 0,
};

const defaultGems: Gems = {
  red: 0,
  green: 0,
  blue: 0,
  white: 0,
  black: 0,
};

const defaultPlayerState: PlayerState = {
  uuid: '',
  tokens: { ...defaultTokens },
  cards: [],
  gems: { ...defaultGems },
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
  tokens: { ...(defaultTokens as Required<Tokens>) },
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
      pickedCard: null,
      pickedTokens: { red: 0, green: 0, blue: 0, white: 0, black: 0 }, // Remove gold
      deck: [],
      players: [],
      currentPlayerIndex: 0,
      isGameOver: false,
      winner: null,
      tiedPlayers: [],
      finalRoundTriggered: false,
      finalRoundPlayer: null,
      needToReturnTokens: false,
      tokensToReturn: 0,

      setBoardSnapshot: () => set({ boardSnapshot: { ...get().board } }),
      resetBoardSnapshot: () =>
        set({ boardSnapshot: { ...initialBoardState } }),
      commitTokens: () => {
        const currentPlayer = get().getCurrentPlayer();
        if (!currentPlayer) return;
        const currentTokenCount = Object.values(currentPlayer.tokens).reduce(
          (sum, count) => sum + count,
          0,
        );
        const pickedTokenCount = Object.values(get().pickedTokens).reduce(
          (sum, count) => sum + count,
          0,
        );
        const totalTokens = currentTokenCount + pickedTokenCount;

        // Check if player will have more than 10 tokens after committing
        if (totalTokens > 10) {
          const tokensOverLimit = totalTokens - 10;

          set((state) => ({
            players: state.players.map((player, index) =>
              index === get().currentPlayerIndex
                ? {
                    ...player,
                    tokens: mergeTokens(player.tokens, {
                      ...state.pickedTokens,
                      gold: 0,
                    }),
                  }
                : player,
            ),
            pickedTokens: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
            needToReturnTokens: true,
            tokensToReturn: tokensOverLimit,
          }));

          notify(
            `You have ${totalTokens} tokens, which exceeds the limit of 10. You must return ${tokensOverLimit} tokens.`,
            'warn',
          );
        } else {
          // Normal commit without exceeding token limit
          set((state) => ({
            players: state.players.map((player, index) =>
              index === get().currentPlayerIndex
                ? {
                    ...player,
                    tokens: mergeTokens(player.tokens, {
                      ...state.pickedTokens,
                      gold: 0,
                    }),
                  }
                : player,
            ),
            pickedTokens: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
          }));
        }
      },
      reset: () => {
        set({
          board: { ...initialBoardState },
          pickedCard: null,
          pickedTokens: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
          deck: [],
          players: [],
          currentPlayerIndex: 0,
          isGameOver: false,
          winner: null,
          finalRoundTriggered: false,
          finalRoundPlayer: null,
          needToReturnTokens: false,
          tokensToReturn: 0,
        });
      },
      init: () => {
        set({ deck: [...deckAll] as Card[] });
      },
      deal: () => {
        if (get().players.length <= 1) {
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
        const dealtIds = new Set<string>();

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

          if (level1Card) dealtIds.add(level1Card.id);
          if (level2Card) dealtIds.add(level2Card.id);
          if (level3Card) dealtIds.add(level3Card.id);
        }

        const newDeck = get().deck.filter((card) => !dealtIds.has(card.id));

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
        set({ board, deck: newDeck }, false);
      },
      setCurrentPlayerIndex: (index) => set({ currentPlayerIndex: index }),
      getCurrentPlayer: () => {
        const { players, currentPlayerIndex } = get();
        return players[currentPlayerIndex];
      },
      getNextPlayerIndex: () => {
        const { players, currentPlayerIndex } = get();
        if (players.length === 0) {
          return undefined;
        }
        return (currentPlayerIndex + 1) % players.length;
      },
      getPlayerById: (uuid: string) => {
        const { players } = get();
        return players.find((player) => player.uuid === uuid);
      },
      getPlayerByIndex: (index: number) => {
        const { players } = get();
        return players[index];
      },
      createPlayers: (quantity) => {
        let qtyPlayersToCreate = quantity;
        if (qtyPlayersToCreate > MAX_PLAYERS) {
          qtyPlayersToCreate = MAX_PLAYERS;
          notify(
            `Only ${MAX_PLAYERS} players can be created, ${quantity} requested.`,
            'info',
          );
        }
        const players = Array.from(
          { length: qtyPlayersToCreate },
          createPlayer,
        );
        set({ players });
      },
      pickToken: (tokenColor: TokenColors) => {
        const { board, boardSnapshot } = get();

        // Don't allow taking gold tokens directly
        if (tokenColor === 'gold') {
          notify('Gold tokens cannot be taken directly', 'info');
          return;
        }

        // Cast tokenColor to ensure it's a valid Tokens key
        const colorKey = tokenColor as keyof Gems;

        // Get number of tokens of this color already picked
        const currentColorCount = get().pickedTokens[colorKey] || 0;

        // Get number of tokens available at the start of the turn
        const availableTokens = boardSnapshot.tokens[tokenColor];

        // Rule 1: Cannot reserve two of the same color if a different color is already reserved
        const differentColorTokens = Object.entries(get().pickedTokens).filter(
          ([color, count]) => color !== colorKey && count > 0,
        );
        if (differentColorTokens.length > 0 && currentColorCount >= 1) {
          notify(
            'Cannot reserve two of the same color when a different color is already reserved',
            'info',
          );
          return;
        }

        // Rule 2: Taking 2 tokens of the same color
        if (currentColorCount >= 1) {
          // Can only take 2 if there were at least 4 available at start of turn
          if (availableTokens < 4) {
            notify(
              'Cannot take 2 tokens of the same color unless 4 or more were available at start of turn',
              'info',
            );
            return;
          }
          // Can't take more than 2 of the same color
          if (currentColorCount >= 2) {
            notify('Cannot take more than 2 tokens of the same color', 'info');
            return;
          }
        }

        // Rule 3: Taking 3 different colored tokens
        else if (currentColorCount === 0) {
          // Check if player is trying to take a different colored token
          if (differentColorTokens.length >= 3) {
            notify('Cannot take more than 3 different colored tokens', 'info');
            return;
          }
          // Ensure not taking 2 of any color when taking different colors
          if (differentColorTokens.some(([_, count]) => Number(count) >= 2)) {
            notify(
              'Cannot mix taking 2 of one color with other colors',
              'info',
            );
            return;
          }
        }

        // Rule 4: Check if there are any tokens of this color left to take
        if (board.tokens[tokenColor] <= 0) {
          notify('No tokens of this color remaining', 'info');
          return;
        }

        // If all checks pass, reserve the token
        set((state) => {
          return {
            board: {
              ...state.board,
              tokens: {
                ...state.board.tokens,
                [tokenColor]: state.board.tokens[tokenColor] - 1,
              },
            },
            pickedTokens: {
              ...state.pickedTokens,
              [colorKey]: state.pickedTokens[colorKey] + 1,
            },
          };
        });
      },
      returnToken: (tokenColor: TokenColors) => {
        const colorKey = tokenColor as keyof Gems;
        const { needToReturnTokens } = get();

        // If player is returning tokens because they exceed the limit
        if (needToReturnTokens) {
          const currentPlayer = get().getCurrentPlayer();

          // Check if player has tokens of this color to return
          if (currentPlayer.tokens[tokenColor] <= 0) {
            notify('No tokens of this color to return', 'info');
            return;
          }

          set((state) => {
            const updatedPlayers = [...state.players];
            const playerIndex = state.currentPlayerIndex;

            // Remove token from player
            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              tokens: {
                ...updatedPlayers[playerIndex].tokens,
                [tokenColor]:
                  updatedPlayers[playerIndex].tokens[tokenColor] - 1,
              },
            };

            // Reduce the count of tokens to return
            const newTokensToReturn = state.tokensToReturn - 1;

            return {
              players: updatedPlayers,
              board: {
                ...state.board,
                tokens: {
                  ...state.board.tokens,
                  [tokenColor]: state.board.tokens[tokenColor] + 1,
                },
              },
              tokensToReturn: newTokensToReturn,
              // If no more tokens need to be returned, set needToReturnTokens to false
              needToReturnTokens: newTokensToReturn > 0,
            };
          });

          if (!get().needToReturnTokens) {
            get().finishTurn();
          }

          return;
        }

        // Normal token return during the token selection phase
        if (get().pickedTokens[colorKey] <= 0) {
          notify('No tokens of this color to return', 'info');
          return;
        }

        set((state) => ({
          board: {
            ...state.board,
            tokens: {
              ...state.board.tokens,
              [tokenColor]: state.board.tokens[tokenColor] + 1,
            },
          },
          pickedTokens: {
            ...state.pickedTokens,
            [colorKey]: state.pickedTokens[colorKey] - 1,
          },
        }));
      },
      canAffordCard: (card) => {
        const player = get().getCurrentPlayer();

        // Calculate effective tokens (tokens + gems) for each color
        const effectiveTokens = (
          Object.keys(card.cost) as Array<keyof Gems>
        ).reduce(
          (acc, color) => {
            acc[color] =
              (player.tokens[color] || 0) + (player.gems[color] || 0);
            return acc;
          },
          {} as Record<keyof Gems, number>,
        );

        // Check if player can afford with regular tokens and gems
        const canAffordWithTokensAndGems = (
          Object.entries(card.cost) as Array<[keyof Gems, number]>
        ).every(([color, qty]) => effectiveTokens[color] >= qty);

        if (canAffordWithTokensAndGems) {
          return true;
        }

        // If not, check if gold tokens can make up the difference
        const shortfall = (
          Object.entries(card.cost) as Array<[keyof Gems, number]>
        ).reduce((total, [color, qty]) => {
          const shortage = Math.max(0, qty - effectiveTokens[color]);
          return total + shortage;
        }, 0);

        return (player.tokens.gold || 0) >= shortfall;
      },
      canAffordNoble: (noble) => {
        const { getCurrentPlayer, pickedCard } = get();
        const player = getCurrentPlayer();

        const gems = pickedCard
          ? addGem(player.gems, pickedCard.card.gem)
          : player.gems;

        // Nobles can only be purchased with a player's gems (not tokens or gold)
        return Object.entries(noble.cost).every(([color, qty]) => {
          const gemColor = color as keyof Gems;
          return gems[gemColor] >= qty;
        });
      },
      getAffordableNobles: () => {
        const { canAffordNoble, board } = get();

        return board.nobles.filter((noble) => canAffordNoble(noble));
      },
      hasAffordableNobles: () => {
        return get().getAffordableNobles().length > 0;
      },
      removePlayerTokensByCardCost: (cardCost) => {
        const player = get().players[get().currentPlayerIndex];
        const newTokens = { ...player.tokens };

        for (const [color, requiredQty] of Object.entries(cardCost) as Array<
          [keyof Gems, number]
        >) {
          const playerGems = player.gems[color] || 0;
          const playerTokens = player.tokens[color] || 0;

          // First use gems (they're free)
          const remainingAfterGems = Math.max(0, requiredQty - playerGems);

          // Then use matching color tokens
          const tokensToUse = Math.min(remainingAfterGems, playerTokens);
          newTokens[color] = (newTokens[color] || 0) - tokensToUse;

          // Finally use gold tokens for any remaining cost
          const remainingAfterTokens = remainingAfterGems - tokensToUse;
          if (remainingAfterTokens > 0) {
            newTokens.gold = (newTokens.gold || 0) - remainingAfterTokens;
          }
        }

        return newTokens;
      },
      commitCard: (reservedCardIndex?: number) => {
        const { pickedCard } = get();
        const currentPlayer = get().getCurrentPlayer();
        let cardToCommit: Card | null = null;
        let fromReserved = false;

        // Determine the source of the card (picked from board or from reserved cards)
        if (
          reservedCardIndex !== undefined &&
          currentPlayer.reservedCards[reservedCardIndex]
        ) {
          // Commit a card from player's reserved cards
          cardToCommit = currentPlayer.reservedCards[reservedCardIndex];
          fromReserved = true;
        } else if (pickedCard) {
          // Commit a card picked from the board
          cardToCommit = pickedCard.card;
        } else {
          console.info('No card selected to commit');
          return false;
        }

        // Check if the player wants to reserve or cannot afford the card
        if (
          (!fromReserved && pickedCard && pickedCard.intent === 'reserve') ||
          !get().canAffordCard(cardToCommit)
        ) {
          // If card was picked from board and player can't afford it (or chose to reserve)
          if (!fromReserved && pickedCard) {
            // Check if player can reserve the card (has less than 3 reserved cards)
            if (currentPlayer.reservedCards.length >= 3) {
              notify('Cannot reserve more than 3 cards', 'error');

              // Return the card to the board
              set((state) => ({
                board: {
                  ...state.board,
                  cards: {
                    ...state.board.cards,
                    [`level${pickedCard.card.level}` as keyof typeof state.board.cards]:
                      [
                        ...state.board.cards[
                          `level${pickedCard.card.level}` as keyof typeof state.board.cards
                        ],
                        pickedCard.card,
                      ],
                  },
                },
                pickedCard: null,
              }));
              return false;
            }

            // Reserve the card and give a gold token if available
            const willGetGold = get().board.tokens.gold > 0;
            set((state) => ({
              players: state.players.map((player, i) =>
                i === get().currentPlayerIndex
                  ? {
                      ...player,
                      reservedCards: [...player.reservedCards, pickedCard.card],
                      tokens: {
                        ...player.tokens,
                        gold:
                          state.board.tokens.gold > 0
                            ? player.tokens.gold + 1
                            : player.tokens.gold,
                      },
                    }
                  : player,
              ),
              board: {
                ...state.board,
                cards: {
                  ...state.board.cards,
                  [`level${pickedCard.card.level}` as keyof typeof state.board.cards]:
                    state.board.cards[
                      `level${pickedCard.card.level}` as keyof typeof state.board.cards
                    ].filter((c) => c.id !== pickedCard.card.id), // Remove the card from the board
                },
                tokens: {
                  ...state.board.tokens,
                  gold:
                    state.board.tokens.gold > 0
                      ? state.board.tokens.gold - 1
                      : 0,
                },
              },
              pickedCard: null, // Clear the picked card
            }));

            notify(
              'Card reserved' +
                (willGetGold ? ' and a Gold token added.' : '.'),
              'success',
            );
            return false;
          }

          // If trying to buy a reserved card but can't afford it, notify and do nothing
          notify('Cannot afford this card', 'error');
          return false;
        }

        // Calculate the actual tokens spent by the player
        const tokensSpent: Partial<Tokens> = {};

        for (const [color, requiredQty] of Object.entries(
          cardToCommit.cost,
        ) as Array<[keyof Gems, number]>) {
          const playerGems = currentPlayer.gems[color] || 0;
          const playerTokens = currentPlayer.tokens[color] || 0;

          // First use gems (they're free)
          const remainingAfterGems = Math.max(0, requiredQty - playerGems);

          // Then use matching color tokens
          const tokensToUse = Math.min(remainingAfterGems, playerTokens);
          if (tokensToUse > 0) {
            tokensSpent[color] = tokensToUse;
          }

          // Finally use gold tokens for any remaining cost
          const remainingAfterTokens = remainingAfterGems - tokensToUse;
          if (remainingAfterTokens > 0) {
            tokensSpent.gold = (tokensSpent.gold || 0) + remainingAfterTokens;
          }
        }

        // Handle different card sources (board vs reserved)
        set((state) => {
          // Return tokens spent back to the board
          const updatedBoard = {
            ...state.board,
            tokens: {
              ...state.board.tokens,
              red: state.board.tokens.red + (tokensSpent.red || 0),
              green: state.board.tokens.green + (tokensSpent.green || 0),
              blue: state.board.tokens.blue + (tokensSpent.blue || 0),
              white: state.board.tokens.white + (tokensSpent.white || 0),
              black: state.board.tokens.black + (tokensSpent.black || 0),
              gold: state.board.tokens.gold + (tokensSpent.gold || 0),
            },
          };

          // If card was picked from the board, get a new card from the deck
          if (!fromReserved && pickedCard) {
            const pickedCardLevel = pickedCard.card.level;
            const availableCards = state.deck.filter(
              (card) => card.level === pickedCardLevel,
            );
            const newCard =
              availableCards.length > 0 ? availableCards[0] : null;

            // Update the cards on the board
            updatedBoard.cards = {
              ...updatedBoard.cards,
              [`level${pickedCardLevel}` as keyof typeof state.board.cards]:
                (() => {
                  const levelKey =
                    `level${pickedCardLevel}` as keyof typeof state.board.cards;
                  const currentCards = [...state.board.cards[levelKey]];
                  if (newCard) {
                    currentCards.splice(pickedCard.boardIndex, 0, newCard);
                  }
                  return currentCards;
                })(),
            };

            // Return the updated state with new deck and board
            return {
              ...state,
              board: updatedBoard,
              // Remove the new card from the deck if one was drawn
              deck: newCard
                ? state.deck.filter((card) => card.id !== newCard.id)
                : state.deck,
              // Update player state
              players: state.players.map((player, i) =>
                i === get().currentPlayerIndex
                  ? {
                      ...player,
                      cards: [...player.cards, cardToCommit],
                      prestige: player.prestige + cardToCommit.prestige,
                      gems: addGem(player.gems, cardToCommit.gem),
                      tokens: get().removePlayerTokensByCardCost(
                        cardToCommit.cost,
                      ),
                      // If the card was reserved, remove it from reserved cards
                      reservedCards: fromReserved
                        ? player.reservedCards.filter(
                            (_, index) => index !== reservedCardIndex,
                          )
                        : player.reservedCards,
                    }
                  : player,
              ),
              // Clear picked card
              pickedCard: null,
            };
          }

          // If card was from reserved pile, don't need to update board cards or deck.
          // If a board card was orphaned (picked but not committed), restore it.
          const restoredBoard =
            state.pickedCard !== null
              ? (() => {
                  const orphan = state.pickedCard;
                  const levelKey =
                    `level${orphan.card.level}` as keyof typeof state.board.cards;
                  const currentCards = [...updatedBoard.cards[levelKey]];
                  currentCards.splice(orphan.boardIndex, 0, orphan.card);
                  return {
                    ...updatedBoard,
                    cards: { ...updatedBoard.cards, [levelKey]: currentCards },
                  };
                })()
              : updatedBoard;

          return {
            ...state,
            board: restoredBoard,
            players: state.players.map((player, i) =>
              i === get().currentPlayerIndex
                ? {
                    ...player,
                    cards: [...player.cards, cardToCommit],
                    prestige: player.prestige + cardToCommit.prestige,
                    gems: addGem(player.gems, cardToCommit.gem),
                    tokens: get().removePlayerTokensByCardCost(
                      cardToCommit.cost,
                    ),
                    // Remove the card from reserved cards
                    reservedCards: fromReserved
                      ? player.reservedCards.filter(
                          (_, index) => index !== reservedCardIndex,
                        )
                      : player.reservedCards,
                  }
                : player,
            ),
            pickedCard: null,
          };
        });

        // Create a detailed purchase message showing what tokens were actually spent
        const tokenDetails = Object.entries(tokensSpent)
          .filter(([_, amount]) => amount && amount > 0)
          .map(([color, amount]) => `${amount} ${color}`)
          .join(', ');

        notify(
          `Card purchased for ${tokenDetails || 'free (using gems)'}`,
          'success',
        );

        return true;
      },
      reserveFromDeck: (level: 1 | 2 | 3) => {
        const currentPlayer = get().getCurrentPlayer();

        if (currentPlayer.reservedCards.length >= 3) {
          notify('Cannot reserve more than 3 cards', 'error');
          return;
        }

        const availableCards = get().deck.filter(
          (card) => card.level === level,
        );

        if (availableCards.length === 0) {
          notify(`No cards remaining in level ${level} deck`, 'info');
          return;
        }

        const card = availableCards[random(0, availableCards.length - 1)];
        const willGetGold = get().board.tokens.gold > 0;

        const currentTokenCount = Object.values(currentPlayer.tokens).reduce(
          (sum, count) => sum + count,
          0,
        );
        const newTokenCount = currentTokenCount + (willGetGold ? 1 : 0);
        const tokensOverLimit = Math.max(0, newTokenCount - 10);

        set((state) => ({
          players: state.players.map((player, i) =>
            i === state.currentPlayerIndex
              ? {
                  ...player,
                  reservedCards: [...player.reservedCards, card],
                  tokens: {
                    ...player.tokens,
                    gold: willGetGold
                      ? player.tokens.gold + 1
                      : player.tokens.gold,
                  },
                }
              : player,
          ),
          board: {
            ...state.board,
            tokens: {
              ...state.board.tokens,
              gold: willGetGold
                ? state.board.tokens.gold - 1
                : state.board.tokens.gold,
            },
          },
          deck: state.deck.filter((c) => c.id !== card.id),
          needToReturnTokens: tokensOverLimit > 0,
          tokensToReturn: tokensOverLimit,
        }));

        notify(
          `Card reserved from level ${level} deck${
            willGetGold ? ' and a Gold token added.' : '.'
          }`,
          'success',
        );
      },
      pickCard: (card) => {
        if (get().pickedCard) return;

        set((state) => ({
          board: {
            ...state.board,
            cards: {
              ...state.board.cards,
              [`level${card.level}` as keyof typeof state.board.cards]:
                state.board.cards[
                  `level${card.level}` as keyof typeof state.board.cards
                ].filter((c) => c.id !== card.id),
            },
          },
          pickedCard: {
            card,
            intent: 'buy',
            boardIndex: state.board.cards[
              `level${card.level}` as keyof typeof state.board.cards
            ].findIndex((c) => c.id === card.id),
          },
        }));
      },
      setPickedCardIntent: (intent) => {
        const { pickedCard } = get();
        if (!pickedCard) return;
        set({ pickedCard: { ...pickedCard, intent } });
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
          board: {
            ...state.board,
            nobles: state.board.nobles.filter((n) => n.id !== noble.id),
          },
        }));
      },
      nextPlayer: () => {
        set((state) => ({
          boardSnapshot: state.board,
          currentPlayerIndex:
            (state.currentPlayerIndex + 1) % state.players.length,
        }));
      },
      finishTurn: () => {
        get().setBoardSnapshot();
        get().checkWinCondition();

        if (!get().isGameOver) {
          get().nextPlayer();
        }
      },
      canEndTurn: () => {
        const { pickedCard, pickedTokens, needToReturnTokens, board } = get();

        // If player needs to return tokens due to exceeding the limit, they can't end their turn
        if (needToReturnTokens) {
          return false;
        }

        // Forced pass: no valid action is possible
        if (get().isForcedPass()) {
          return true;
        }

        if (
          pickedCard !== null &&
          Object.values(pickedTokens).every((qty) => qty === 0)
        ) {
          return true;
        }

        if (
          !pickedCard &&
          Object.values(pickedTokens).some((qty) => qty === 2)
        ) {
          return true;
        }

        if (
          !pickedCard &&
          Object.values(pickedTokens).filter((qty) => qty === 1).length === 3
        ) {
          return true;
        }

        // Allow ending with 1 or 2 different tokens when no other colours are available
        const differentPickedColors = (
          Object.keys(defaultGems) as GemColors[]
        ).filter((color) => pickedTokens[color] === 1);

        if (!pickedCard && differentPickedColors.length >= 1) {
          const unpickedColorsWithTokens = (
            Object.keys(defaultGems) as GemColors[]
          ).filter(
            (color) => pickedTokens[color] === 0 && board.tokens[color] > 0,
          );
          if (unpickedColorsWithTokens.length === 0) {
            return true;
          }
        }

        return false;
      },
      isForcedPass: () => {
        const { board, pickedCard, pickedTokens } = get();
        const currentPlayer = get().getCurrentPlayer();

        // Not forced if the player has already taken an action this turn
        if (pickedCard !== null) return false;
        if (Object.values(pickedTokens).some((qty) => qty > 0)) return false;

        // Can take tokens if any gem colour has tokens remaining
        const anyTokensAvailable = (
          Object.keys(defaultGems) as GemColors[]
        ).some((color) => board.tokens[color] > 0);
        if (anyTokensAvailable) return false;

        // Can reserve from deck if under the 3-card limit
        const allLevelCards = [
          ...board.cards.level1,
          ...board.cards.level2,
          ...board.cards.level3,
        ];
        const deckHasCards = get().deck.length > 0;
        const canReserve =
          currentPlayer.reservedCards.length < 3 &&
          (allLevelCards.length > 0 || deckHasCards);
        if (canReserve) return false;

        // Can buy any card on the board or in reserved hand
        const boardCards = allLevelCards;
        const allAvailableCards = [
          ...boardCards,
          ...currentPlayer.reservedCards,
        ];
        const canAffordAny = allAvailableCards.some((card) =>
          get().canAffordCard(card),
        );
        if (canAffordAny) return false;

        return true;
      },
      checkWinCondition: () => {
        const currentPlayer = get().getCurrentPlayer();
        const getNextPlayerIndex = get().getNextPlayerIndex();
        const currentPlayerIndex = get().currentPlayerIndex;

        // Check if this player has reached 15 points
        if (currentPlayer.prestige >= 15 && !get().finalRoundTriggered) {
          set({
            finalRoundTriggered: true,
            finalRoundPlayer: currentPlayerIndex,
          });

          notify(
            `${`Player ${currentPlayerIndex + 1}`} has reached 15 points! Final round started.`,
            'info',
          );

          return;
        }

        // Check if the round has come back to the player who triggered final round
        if (
          get().finalRoundTriggered &&
          get().finalRoundPlayer !== null &&
          getNextPlayerIndex === get().finalRoundPlayer
        ) {
          // Find the player with the highest prestige
          let maxPrestige = 0;
          let winnerIndex = 0;
          let tiedIndexes: number[] = [];

          get().players.forEach((player, index) => {
            if (player.prestige > maxPrestige) {
              maxPrestige = player.prestige;
              winnerIndex = index;
              tiedIndexes = [];
            } else if (player.prestige === maxPrestige && maxPrestige > 0) {
              // In case of a tie, the player with fewer cards wins
              const currentWinner = get().players[winnerIndex];
              if (player.cards.length < currentWinner.cards.length) {
                winnerIndex = index;
                tiedIndexes = [];
              } else if (player.cards.length === currentWinner.cards.length) {
                if (tiedIndexes.length === 0) {
                  tiedIndexes = [winnerIndex, index];
                } else {
                  tiedIndexes.push(index);
                }
              }
            }
          });

          const isTie = tiedIndexes.length > 0;

          set({
            isGameOver: true,
            winner: isTie ? null : get().players[winnerIndex],
            tiedPlayers: isTie ? tiedIndexes.map((i) => get().players[i]) : [],
          });

          if (isTie) {
            notify("Game Over! It's a tie!", 'success');
          } else {
            const winner = get().players[winnerIndex];
            notify(
              `Game Over! ${`Player ${winnerIndex + 1}`} wins with ${winner.prestige} prestige points!`,
              'success',
            );
          }
        }
      },
      endTurn: () => {
        if (get().pickedCard !== null) {
          get().commitCard();
        } else {
          get().commitTokens();
        }

        if (get().needToReturnTokens) {
          return;
        }

        get().finishTurn();
      },
    }),
  ),
);
