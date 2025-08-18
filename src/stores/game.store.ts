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
  finalRoundTriggered: boolean;
  finalRoundPlayer: number | null;

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
  commitCard: (reservedCardIndex?: number) => void;
  pickCard: (card: Card) => void;
  claimNoble: (noble: Noble) => void;
  nextPlayer: () => void;
  canEndTurn: () => boolean;
  checkWinCondition: () => void;
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
      finalRoundTriggered: false,
      finalRoundPlayer: null,

      setBoardSnapshot: () => set({ boardSnapshot: { ...get().board } }),
      resetBoardSnapshot: () =>
        set({ boardSnapshot: { ...initialBoardState } }),
      commitTokens: () => {
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
        });
      },
      init: () => {
        const deckAllCopy = [...deckAll] as Card[];
        get().deck = deckAllCopy;
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

        // Get total number of tokens currently picked
        const totalPickedTokens = Object.values(get().pickedTokens).reduce(
          (sum, count) => sum + count,
          0,
        );

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

        // Rule 5: Players can't hold more than 10 tokens total
        const playerCurrentTokens = Object.values(
          get().players[get().currentPlayerIndex].tokens,
        ).reduce((sum, count) => sum + count, 0);
        if (playerCurrentTokens + totalPickedTokens + 1 > 10) {
          notify('Cannot hold more than 10 tokens total', 'info');
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

        const gems = addGem(player.gems, pickedCard?.card.gem);

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
          return;
        }

        // Check if the player can afford the card
        if (!get().canAffordCard(cardToCommit)) {
          // If card was picked from board and player can't afford it, reserve it
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
              return;
            }

            // Reserve the card and give a gold token if available
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
                (get().board.tokens.gold > 0
                  ? ' and a Gold token added.'
                  : '.'),
              'success',
            );
            return;
          }

          // If trying to buy a reserved card but can't afford it, notify and do nothing
          notify('Cannot afford this card', 'error');
          return;
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

          // If card was from reserved pile, don't need to update board cards or deck
          return {
            ...state,
            board: updatedBoard,
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
            // Clear picked card if applicable
            pickedCard: !fromReserved ? null : state.pickedCard,
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
            boardIndex: state.board.cards[
              `level${card.level}` as keyof typeof state.board.cards
            ].findIndex((c) => c.id === card.id),
          },
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
      canEndTurn: () => {
        const { pickedCard, pickedTokens } = get();

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

        return false;
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
          let tie = false;

          get().players.forEach((player, index) => {
            if (player.prestige > maxPrestige) {
              maxPrestige = player.prestige;
              winnerIndex = index;
              tie = false;
            } else if (player.prestige === maxPrestige && maxPrestige > 0) {
              // In case of a tie, the player with fewer cards wins
              const currentWinner = get().players[winnerIndex];
              if (player.cards.length < currentWinner.cards.length) {
                winnerIndex = index;
                tie = false;
              } else if (player.cards.length === currentWinner.cards.length) {
                tie = true;
              }
            }
          });

          set({
            isGameOver: true,
            winner: tie ? null : get().players[winnerIndex],
          });

          if (tie) {
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
        get().commitCard();
        get().commitTokens();
        get().setBoardSnapshot();
        get().checkWinCondition();

        if (!get().isGameOver) {
          get().nextPlayer();
        }
      },
    }),
  ),
);
