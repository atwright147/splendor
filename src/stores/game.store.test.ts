import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import deckAll from '../../ref/cards.json';
import {
  type Card,
  initialBoardState,
  type Noble,
  type Tokens,
  useGameStore,
} from './game.store';
import { useNotificationStore } from './notifications.store';

describe('Game Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useGameStore());

    act(() => result.current.reset());
  });

  describe('commitTokens()', () => {
    it('should commit the picked tokens to the current player', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      act(() => result.current.pickToken('red'));
      act(() => result.current.commitTokens());

      const player = result.current.getCurrentPlayer();

      expect(player.tokens.red).toBe(1);
      expect(result.current.board.tokens.red).toBe(3);
    });

    it('should reset the picked tokens after committing', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.pickToken('red'));
      act(() => result.current.commitTokens());

      expect(result.current.pickedTokens.red).toBe(0);
    });

    it('should commit tokens to the player even when the total exceeds 10', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      // Give the player 9 tokens already
      result.current.players[0].tokens = {
        red: 3,
        green: 3,
        blue: 3,
        white: 0,
        black: 0,
        gold: 0,
      };

      act(() => result.current.pickToken('white'));
      act(() => result.current.pickToken('black'));
      act(() => result.current.commitTokens());

      const player = result.current.getCurrentPlayer();
      const totalTokens = Object.values(player.tokens).reduce(
        (sum, count) => sum + count,
        0,
      );

      // Tokens should be committed (total > 10 before returning)
      expect(totalTokens).toBe(11);
      expect(player.tokens.white).toBe(1);
      expect(player.tokens.black).toBe(1);
    });

    it('should set needToReturnTokens and tokensToReturn when total exceeds 10', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].tokens = {
        red: 3,
        green: 3,
        blue: 3,
        white: 0,
        black: 0,
        gold: 0,
      };

      act(() => result.current.pickToken('white'));
      act(() => result.current.pickToken('black'));
      act(() => result.current.commitTokens());

      expect(result.current.needToReturnTokens).toBe(true);
      expect(result.current.tokensToReturn).toBe(1);
    });

    it('should clear pickedTokens when total exceeds 10', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].tokens = {
        red: 3,
        green: 3,
        blue: 3,
        white: 0,
        black: 0,
        gold: 0,
      };

      act(() => result.current.pickToken('white'));
      act(() => result.current.pickToken('black'));
      act(() => result.current.commitTokens());

      const allZero = Object.values(result.current.pickedTokens).every(
        (count) => count === 0,
      );
      expect(allZero).toBe(true);
    });
  });

  describe('deal()', () => {
    it('should return early when no players are created', () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useGameStore());

      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      expect(result.current.board).toEqual({
        cards: {
          level1: [],
          level2: [],
          level3: [],
        },
        nobles: [],
        tokens: {
          black: 0,
          blue: 0,
          gold: 0,
          green: 0,
          red: 0,
          white: 0,
        },
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith('Players not created');
    });

    describe('sets the correct number of tokens and nobles based on the number of players', () => {
      it('2 players, 4 tokens, 3 nobles', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(2));
        act(() => result.current.deal());

        expect(result.current.board.tokens.black).toBe(4);
        expect(result.current.board.nobles.length).toBe(3);
      });

      it('3 players, 5 tokens, 4 nobles', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(3));
        act(() => result.current.deal());

        expect(result.current.board.tokens.black).toBe(5);
        expect(result.current.board.nobles.length).toBe(4);
      });

      it('4 players, 7 tokens, 5 nobles', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(4));
        act(() => result.current.deal());

        expect(result.current.board.tokens.black).toBe(7);
        expect(result.current.board.nobles.length).toBe(5);
      });

      it('should deal 5 unique nobles', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(4));
        act(() => result.current.deal());

        expect(
          new Set(result.current.board.nobles.map((noble) => noble.id)).size,
        ).toBe(5);
      });
    });

    it('deals the correct number of cards for each level', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());

      expect(result.current.board.cards.level1.length).toBe(4);
      expect(result.current.board.cards.level2.length).toBe(4);
      expect(result.current.board.cards.level3.length).toBe(4);
    });

    it('removes dealt cards from the deck', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.init());

      const initialDeckLength = result.current.deck.length;

      act(() => result.current.createPlayers(2));
      act(() => result.current.deal());

      expect(result.current.deck.length).toBeLessThan(initialDeckLength);
    });

    it('sets the correct board state', () => {
      const { result } = renderHook(() => useGameStore());

      result.current.deck = [...deckAll] as Card[];
      result.current.board = { ...initialBoardState };

      act(() => result.current.createPlayers(2));
      act(() => result.current.deal());

      expect(result.current.board).toEqual({
        cards: {
          level1: expect.any(Array),
          level2: expect.any(Array),
          level3: expect.any(Array),
        },
        tokens: {
          gold: 5,
          black: 4,
          blue: 4,
          green: 4,
          red: 4,
          white: 4,
        },
        nobles: expect.any(Array),
      });
    });
  });

  describe('setCurrentPlayerIndex()', () => {
    it('sets the current player index', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.setCurrentPlayerIndex(2));

      expect(result.current.currentPlayerIndex).toBe(2);
    });
  });

  describe('createPlayers()', () => {
    it('creates players', () => {
      const { result } = renderHook(() => useGameStore());
      const quantity = 4;

      result.current.players = [];

      expect(result.current.players.length).toBe(0);

      act(() => result.current.createPlayers(quantity));

      expect(result.current.players.length).toBe(quantity);
    });

    it('does not create more than 4 players', () => {
      vi.spyOn(console, 'info').mockImplementation(() => {});

      const { result } = renderHook(() => useGameStore());
      const quantity = 5;

      act(() => result.current.createPlayers(quantity));

      expect(result.current.players.length).toBe(4);
    });
  });

  describe('getCurrentPlayer()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.setCurrentPlayerIndex(0));
    });

    it('should get the current player', () => {
      const { result } = renderHook(() => useGameStore());

      const player2 = result.current.players[1];

      act(() => result.current.setCurrentPlayerIndex(1));

      expect(result.current.getCurrentPlayer()).toEqual(player2);
    });
  });

  describe('getPlayerById()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
    });

    it('should get a player by their ID', () => {
      const { result } = renderHook(() => useGameStore());

      const player2 = result.current.players[1];

      expect(result.current.getPlayerById(player2.uuid)).toEqual(player2);
    });
  });

  describe('getPlayerByIndex()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
    });

    it('should get a player by their index', () => {
      const { result } = renderHook(() => useGameStore());

      const player2 = result.current.players[1];

      expect(result.current.getPlayerByIndex(1)).toEqual(player2);
    });
  });

  describe('pickToken()', () => {
    it('reserves a token when no tokens are reserved and available tokens are not less than 4', () => {
      vi.spyOn(console, 'info').mockImplementation(() => {});

      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      const tokenColor = 'red';
      result.current.boardSnapshot.tokens[tokenColor] = 4;

      act(() => result.current.pickToken(tokenColor));

      expect(result.current.pickedTokens[tokenColor]).toBe(1);
    });

    it('given 4 tokens of the same color are on the board and no other tokens are reserved, should reserve 2 tokens of the same color', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      const tokenColor = 'red';
      const token1 = tokenColor;
      const token2 = tokenColor;

      result.current.boardSnapshot.tokens[tokenColor] = 4;

      act(() => result.current.pickToken(token1));
      act(() => result.current.pickToken(token2));

      expect(result.current.pickedTokens[tokenColor]).toBe(2);
    });

    it('given 4 tokens of the same color are on the board and tokens of other colors are reserved, should not reserve a second token', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      const tokenColor = 'red';
      const otherTokenColor = 'blue';
      const token1 = tokenColor;
      const token2 = otherTokenColor;
      const token3 = tokenColor;

      act(() => result.current.createPlayers(2));
      act(() => result.current.pickToken(token1));
      act(() => result.current.pickToken(token2));
      act(() => result.current.pickToken(token3));

      expect(result.current.pickedTokens[tokenColor]).toBe(1);
    });

    it('reserves a token when a token of a different color is already reserved', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      const token1 = 'red';
      const token2 = 'blue';

      act(() => result.current.pickToken(token1));
      act(() => result.current.pickToken(token2));

      expect(result.current.pickedTokens[token1]).toBe(1);
      expect(result.current.pickedTokens[token2]).toBe(1);
    });

    it('does not reserve a token when a token of the same color is already reserved and other tokens are reserved', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      const token1 = 'red';
      const token2 = 'blue';
      const token3 = 'red';

      act(() => result.current.pickToken(token1));
      act(() => result.current.pickToken(token2));
      act(() => result.current.pickToken(token3));

      expect(result.current.pickedTokens[token1]).toBe(1);
      expect(result.current.pickedTokens[token2]).toBe(1);
      expect(result.current.pickedTokens[token3]).toBe(1); // should not be 2
    });

    it('does not reserve a token when the available tokens are less than 4', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      const token = 'red';

      // simulate available tokens being less than 4
      result.current.board.tokens[token] = 3;

      act(() => result.current.pickToken(token));

      expect(result.current.pickedTokens).not.toContain(token);
    });

    it('does not pick a token when a card is already picked this turn', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      const card = result.current.board.cards.level1[0];
      act(() => result.current.pickCard(card));

      expect(result.current.pickedCard).not.toBeNull();

      act(() => result.current.pickToken('red'));

      expect(result.current.pickedTokens.red).toBe(0);
    });
  });

  describe('canAffordCard()', () => {
    it('returns true if the player can afford the card', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].tokens.red = 1;
      result.current.players[0].tokens.green = 2;
      result.current.players[0].tokens.blue = 0;
      result.current.players[0].tokens.black = 0;
      result.current.players[0].tokens.white = 0;

      expect(result.current.canAffordCard(card)).toBe(true);
    });

    it('should return false if the player cannot afford the card', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].tokens.red = 1;
      result.current.players[0].tokens.green = 0;
      result.current.players[0].tokens.blue = 0;
      result.current.players[0].tokens.black = 0;
      result.current.players[0].tokens.white = 0;
      result.current.players[0].tokens.gold = 0;
      result.current.players[0].gems = {
        red: 0,
        green: 0,
        blue: 0,
        black: 0,
        white: 0,
      };

      expect(result.current.canAffordCard(card)).toBe(false);
    });

    it('returns true if the player cannot afford the card with token but has enough gold', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].tokens.red = 1;
      result.current.players[0].tokens.green = 1;
      result.current.players[0].tokens.blue = 0;
      result.current.players[0].tokens.black = 0;
      result.current.players[0].tokens.white = 0;
      result.current.players[0].tokens.gold = 1; // gold can be used as a wildcard

      expect(result.current.canAffordCard(card)).toBe(true);
    });
  });

  describe('canAffordNoble()', () => {
    it('returns true if the player can afford the noble via held Gems and picked card', () => {
      const { result } = renderHook(() => useGameStore());
      const noble: Noble = {
        id: '1',
        prestige: 1,
        cost: { red: 3, green: 3, blue: 3, black: 0, white: 0 },
      };
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'blue', // add blue so that the player can afford the card
        level: 1,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));
      act(() => result.current.pickCard(card));

      result.current.players[0].gems.red = 3;
      result.current.players[0].gems.green = 3;
      result.current.players[0].gems.blue = 2; // not enough gems without picked card
      result.current.players[0].gems.black = 0;
      result.current.players[0].gems.white = 0;

      expect(result.current.canAffordNoble(noble)).toBe(true);
    });

    it('returns false if the player cannot afford the noble', () => {
      const { result } = renderHook(() => useGameStore());
      const noble: Noble = {
        id: '1',
        prestige: 1,
        cost: { red: 3, green: 3, blue: 3, black: 0, white: 0 },
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].gems.red = 2;
      result.current.players[0].gems.green = 2;
      result.current.players[0].gems.blue = 2;
      result.current.players[0].gems.black = 0;
      result.current.players[0].gems.white = 0;

      expect(result.current.canAffordNoble(noble)).toBe(false);
    });

    it('returns false when pickedCard is null and gems fall short (no undefined addGem call)', () => {
      const { result } = renderHook(() => useGameStore());
      const noble: Noble = {
        id: '1',
        prestige: 1,
        cost: { red: 3, green: 0, blue: 0, black: 0, white: 0 },
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].gems.red = 2; // one short

      // No pickCard call — pickedCard is null
      expect(result.current.canAffordNoble(noble)).toBe(false);
    });

    it('returns true when pickedCard is null and player gems alone are sufficient', () => {
      const { result } = renderHook(() => useGameStore());
      const noble: Noble = {
        id: '1',
        prestige: 1,
        cost: { red: 3, green: 0, blue: 0, black: 0, white: 0 },
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].gems.red = 3;

      // No pickCard call — pickedCard is null
      expect(result.current.canAffordNoble(noble)).toBe(true);
    });
  });

  describe('getAffordableNobles()', () => {
    it('returns an array of Nobles that the player can afford', () => {
      const { result } = renderHook(() => useGameStore());
      const noble1: Noble = {
        id: '1',
        prestige: 1,
        cost: { red: 3, green: 3, blue: 3, black: 0, white: 0 },
      };
      const noble2: Noble = {
        id: '2',
        prestige: 2,
        cost: { red: 4, green: 4, blue: 0, black: 0, white: 0 },
      };
      const noble3: Noble = {
        id: '3',
        prestige: 3,
        cost: { red: 2, green: 2, blue: 2, black: 0, white: 0 },
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.board.nobles = [noble1, noble2, noble3];

      result.current.players[0].gems.red = 3;
      result.current.players[0].gems.green = 3;
      result.current.players[0].gems.blue = 3;
      result.current.players[0].gems.black = 0;
      result.current.players[0].gems.white = 0;

      expect(result.current.getAffordableNobles()).toEqual([noble1, noble3]);
    });

    it('returns an empty array if the player cannot afford any nobles', () => {
      const { result } = renderHook(() => useGameStore());
      const noble1: Noble = {
        id: '1',
        prestige: 1,
        cost: { red: 3, green: 3, blue: 3, black: 0, white: 0 },
      };
      const noble2: Noble = {
        id: '2',
        prestige: 2,
        cost: { red: 4, green: 4, blue: 0, black: 0, white: 0 },
      };
      const noble3: Noble = {
        id: '3',
        prestige: 3,
        cost: { red: 3, green: 3, blue: 3, black: 0, white: 0 },
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.board.nobles = [noble1, noble2, noble3];

      result.current.players[0].gems.red = 2;
      result.current.players[0].gems.green = 2;
      result.current.players[0].gems.blue = 2;
      result.current.players[0].gems.black = 2;
      result.current.players[0].gems.white = 2;

      expect(result.current.getAffordableNobles()).toEqual([]);
    });
  });

  describe('hasAffordableNobles()', () => {
    it('returns true if the player can afford any Nobles', () => {
      const { result } = renderHook(() => useGameStore());
      const noble1: Noble = {
        id: '1',
        prestige: 1,
        cost: { red: 3, green: 3, blue: 3, black: 0, white: 0 },
      };
      const noble2: Noble = {
        id: '2',
        prestige: 2,
        cost: { red: 4, green: 4, blue: 0, black: 0, white: 0 },
      };
      const noble3: Noble = {
        id: '3',
        prestige: 3,
        cost: { red: 2, green: 2, blue: 2, black: 0, white: 0 },
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.board.nobles = [noble1, noble2, noble3];

      result.current.players[0].gems.red = 3;
      result.current.players[0].gems.green = 3;
      result.current.players[0].gems.blue = 3;
      result.current.players[0].gems.black = 0;
      result.current.players[0].gems.white = 0;

      expect(result.current.hasAffordableNobles()).toBe(true);
    });

    it('returns false if the player cannot afford any Nobles', () => {
      const { result } = renderHook(() => useGameStore());
      const noble1: Noble = {
        id: '1',
        prestige: 1,
        cost: { red: 3, green: 3, blue: 3, black: 0, white: 0 },
      };
      const noble2: Noble = {
        id: '2',
        prestige: 2,
        cost: { red: 4, green: 4, blue: 0, black: 0, white: 0 },
      };
      const noble3: Noble = {
        id: '3',
        prestige: 3,
        cost: { red: 3, green: 3, blue: 3, black: 0, white: 0 },
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.board.nobles = [noble1, noble2, noble3];

      result.current.players[0].gems.red = 2;
      result.current.players[0].gems.green = 2;
      result.current.players[0].gems.blue = 2;
      result.current.players[0].gems.black = 2;
      result.current.players[0].gems.white = 2;

      expect(result.current.hasAffordableNobles()).toBe(false);
    });
  });

  describe('commitCard()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());
      const quantity = 2;

      act(() => result.current.createPlayers(quantity));
    });

    it("adds card to current player's hand", () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.setCurrentPlayerIndex(0));

      const player = result.current.getCurrentPlayer();
      player.tokens = {
        red: 1,
        green: 2,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      };

      act(() => result.current.pickCard(card));
      act(() => result.current.commitCard());

      expect(result.current.players[0].cards).toContain(card);
    });

    it('returns true when a card is successfully purchased from the board', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].tokens = {
        red: 1,
        green: 2,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      };

      act(() => result.current.pickCard(card));

      let purchased = false;
      act(() => {
        purchased = result.current.commitCard();
      });

      expect(purchased).toBe(true);
    });

    it('returns false when the player cannot afford the card and it is reserved instead', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 5, green: 5, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.setCurrentPlayerIndex(0));
      result.current.players[0].tokens = {
        red: 0,
        green: 0,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      };

      act(() => result.current.pickCard(card));

      let purchased = false;
      act(() => {
        purchased = result.current.commitCard();
      });

      expect(purchased).toBe(false);
      expect(result.current.players[0].reservedCards).toContainEqual(card);
    });

    it('returns true when purchasing a card from reservedCards', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-reserved',
        cost: { red: 1, green: 0, blue: 0, black: 0, white: 0 },
        prestige: 2,
        gem: 'green',
        level: 1,
      };

      act(() => result.current.setCurrentPlayerIndex(0));
      result.current.players[0].reservedCards = [card];
      result.current.players[0].tokens = {
        red: 1,
        green: 0,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      };

      let purchased = false;
      act(() => {
        purchased = result.current.commitCard(0);
      });

      expect(purchased).toBe(true);
      expect(result.current.players[0].cards).toContainEqual(card);
      expect(result.current.players[0].reservedCards).not.toContainEqual(card);
    });

    it('returns false when trying to purchase a reserved card the player cannot afford', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-reserved',
        cost: { red: 5, green: 0, blue: 0, black: 0, white: 0 },
        prestige: 2,
        gem: 'green',
        level: 1,
      };

      act(() => result.current.setCurrentPlayerIndex(0));
      result.current.players[0].reservedCards = [card];
      result.current.players[0].tokens = {
        red: 0,
        green: 0,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      };

      let purchased = false;
      act(() => {
        purchased = result.current.commitCard(0);
      });

      expect(purchased).toBe(false);
      expect(result.current.players[0].cards).not.toContainEqual(card);
    });

    it('returns false (not undefined) when no card is picked', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.setCurrentPlayerIndex(0));

      // pickedCard is null by default — no card has been picked
      let returnValue: boolean | undefined;
      act(() => {
        returnValue = result.current.commitCard();
      });

      expect(returnValue).toBe(false);
      expect(returnValue).not.toBeUndefined();
    });

    it('restores orphaned board card when buying a reserved card while a board card is picked', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      // Grab a board card and pick it
      const boardCard = result.current.board.cards.level1[0];
      const boardCardsBefore = result.current.board.cards.level1.length;

      act(() => result.current.pickCard(boardCard));

      // Board now missing the picked card
      expect(result.current.board.cards.level1).not.toContainEqual(boardCard);
      expect(result.current.pickedCard?.card).toEqual(boardCard);

      // Now buy a reserved card while boardCard is still orphaned
      const reservedCard: Card = {
        id: 'mockUuid-reserved-orphan',
        cost: { red: 0, green: 0, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };
      result.current.players[0].reservedCards = [reservedCard];

      act(() => result.current.commitCard(0));

      // Reserved card should be purchased
      expect(result.current.players[0].cards).toContainEqual(reservedCard);
      // Orphaned board card should be restored to the board
      expect(result.current.board.cards.level1).toContainEqual(boardCard);
      expect(result.current.board.cards.level1.length).toBe(boardCardsBefore);
      // pickedCard should be cleared
      expect(result.current.pickedCard).toBeNull();
    });

    describe('reservation notification includes gold when last gold is taken', () => {
      beforeEach(() => {
        const { result: notifResult } = renderHook(() =>
          useNotificationStore(),
        );
        act(() => notifResult.current.clear());
      });

      it('says "and a Gold token added" when the last gold token is taken on reserve', () => {
        const { result } = renderHook(() => useGameStore());
        const card: Card = {
          id: 'mockUuid-notify-gold',
          cost: { red: 9, green: 0, blue: 0, black: 0, white: 0 },
          prestige: 1,
          gem: 'red',
          level: 1,
        };

        act(() => result.current.createPlayers(2));
        act(() => result.current.init());
        act(() => result.current.deal());
        act(() => result.current.setCurrentPlayerIndex(0));

        // Exactly 1 gold left on the board
        result.current.board.tokens.gold = 1;
        result.current.players[0].tokens = {
          red: 0,
          green: 0,
          blue: 0,
          black: 0,
          white: 0,
          gold: 0,
        };

        act(() => result.current.pickCard(card));
        act(() => result.current.commitCard());

        const { result: notifResult } = renderHook(() =>
          useNotificationStore(),
        );
        const messages = notifResult.current.notifications.map(
          (notification) => notification.message,
        );
        expect(
          messages.some((message) => message.includes('Gold token added')),
        ).toBe(true);
      });

      it('says "Card reserved." (no gold mention) when no gold is available', () => {
        const { result } = renderHook(() => useGameStore());
        const card: Card = {
          id: 'mockUuid-notify-nogold',
          cost: { red: 9, green: 0, blue: 0, black: 0, white: 0 },
          prestige: 1,
          gem: 'red',
          level: 1,
        };

        act(() => result.current.createPlayers(2));
        act(() => result.current.init());
        act(() => result.current.deal());
        act(() => result.current.setCurrentPlayerIndex(0));

        // No gold on the board
        result.current.board.tokens.gold = 0;
        result.current.players[0].tokens = {
          red: 0,
          green: 0,
          blue: 0,
          black: 0,
          white: 0,
          gold: 0,
        };

        act(() => result.current.pickCard(card));
        act(() => result.current.commitCard());

        const { result: notifResult } = renderHook(() =>
          useNotificationStore(),
        );
        const messages = notifResult.current.notifications.map(
          (notification) => notification.message,
        );
        expect(
          messages.some((message) => message.includes('Gold token added')),
        ).toBe(false);
        expect(
          messages.some((message) => message.startsWith('Card reserved')),
        ).toBe(true);
      });
    });
  });

  describe('pickCard()', () => {
    it('reserves a card for the current player', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.createPlayers(2));
      act(() => result.current.setCurrentPlayerIndex(0));

      const player = result.current.getCurrentPlayer();

      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      player.tokens = {
        red: 1,
        green: 2,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      };

      act(() => result.current.pickCard(card));

      expect(result.current.pickedCard).toEqual({
        boardIndex: -1,
        card,
        intent: 'buy',
      });
    });

    it('reserves a card when there are multiple players', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(1));

      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      result.current.players[1].tokens = {
        red: 1,
        green: 2,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      };

      act(() => result.current.pickCard(card));

      expect(result.current.pickedCard).toEqual({
        boardIndex: -1,
        card,
        intent: 'buy',
      });
    });

    it('removes card from the board', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      const card = result.current.board.cards.level1[0];

      const player = result.current.getCurrentPlayer();
      player.tokens = { ...card.cost, gold: 0 };

      act(() => result.current.pickCard(card));

      expect(result.current.board.cards.level1).not.toContain(card);
    });

    it('should not allow picking a card if one is already picked', () => {
      const { result } = renderHook(() => useGameStore());

      const card1: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };
      const card2: Card = {
        id: 'mockUuid-2',
        cost: { red: 1, green: 1, blue: 1, black: 0, white: 0 },
        prestige: 1,
        gem: 'green',
        level: 1,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      act(() => result.current.pickCard(card1));

      expect(result.current.pickedCard).toEqual({
        boardIndex: -1,
        card: card1,
        intent: 'buy',
      });

      act(() => result.current.pickCard(card2));

      expect(result.current.pickedCard).toEqual({
        boardIndex: -1,
        card: card1,
        intent: 'buy',
      });
    });

    it('does not pick a card when tokens are already picked this turn', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      act(() => result.current.pickToken('red'));

      expect(result.current.pickedTokens.red).toBe(1);

      const card = result.current.board.cards.level1[0];
      act(() => result.current.pickCard(card));

      expect(result.current.pickedCard).toBeNull();
    });
  });

  describe('claimNoble()', () => {
    it('should update the current player with the noble prestige and add the noble to the nobles list', () => {
      const { result } = renderHook(() => useGameStore());
      const noble: Noble = {
        id: '1',
        prestige: 10,
        cost: { red: 1, green: 1, blue: 1, black: 0, white: 0 },
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      const playerUuid = result.current.players[0].uuid;
      act(() => result.current.claimNoble(noble));

      const player = result.current.getPlayerById(playerUuid)!;

      expect(player.prestige).toBe(10);
      expect(player.nobles).toContainEqual(noble);
    });

    it('should remove the noble from the nobles list', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      const noble = result.current.board.nobles[0];

      result.current.pickedTokens = {
        ...noble.cost,
      };

      act(() => result.current.claimNoble(noble));

      expect(result.current.board.nobles).not.toContainEqual(noble);
    });

    it('should not update other players', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      const noble = result.current.board.nobles[0];
      const otherPlayerUuid = result.current.players[1].uuid;

      result.current.pickedTokens = {
        ...noble.cost,
      };

      act(() => result.current.claimNoble(noble));

      const otherPlayer = result.current.getPlayerById(otherPlayerUuid)!;

      expect(otherPlayer.prestige).toBe(0);
      expect(otherPlayer.nobles).not.toContainEqual(noble);
    });
  });

  describe('nextPlayer()', () => {
    it('should select the next player', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(3));

      expect(result.current.currentPlayerIndex).toBe(0);

      act(() => result.current.nextPlayer());

      expect(result.current.currentPlayerIndex).toBe(1);
    });

    it('should wrap around to the first player when current player is the last player', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(3));
      act(() => result.current.setCurrentPlayerIndex(2));

      expect(result.current.currentPlayerIndex).toBe(2);

      act(() => result.current.nextPlayer());

      expect(result.current.currentPlayerIndex).toBe(0);
    });

    it('should update `boardSnapshot` state', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.board = {
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

      result.current.boardSnapshot = result.current.board;

      act(() => result.current.createPlayers(2));

      expect(result.current.boardSnapshot).toEqual(result.current.board);

      result.current.board = {
        cards: {
          level1: [],
          level2: [],
          level3: [],
        },
        tokens: {
          red: 4,
          green: 0,
          blue: 0,
          white: 0,
          black: 0,
          gold: 0,
        },
        nobles: [],
      };

      act(() => result.current.nextPlayer());

      expect(result.current.boardSnapshot).toEqual(result.current.board);
    });
  });

  describe('canEndTurn()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());

      result.current.pickedCard = null;
      result.current.pickedTokens = {
        red: 0,
        green: 0,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      } as Tokens;
    });

    it('should return true if a card is picked and no tokens are picked', () => {
      const { result } = renderHook(() => useGameStore());

      const player = result.current.getCurrentPlayer();
      player.tokens = {
        red: 1,
        green: 2,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      };

      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.pickCard(card));

      expect(result.current.canEndTurn()).toBe(true);
    });

    it('should return true if no card is picked but three different tokens are picked', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.pickToken('red'));
      act(() => result.current.pickToken('green'));
      act(() => result.current.pickToken('blue'));

      expect(result.current.canEndTurn()).toBe(true);
    });

    it('should return true if no card is picked but two tokens of the same color are picked', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.pickToken('red'));
      act(() => result.current.pickToken('red'));

      expect(result.current.canEndTurn()).toBe(true);
    });

    it('should return false if no card is picked and only one token is picked', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.pickToken('red'));

      expect(result.current.canEndTurn()).toBe(false);
    });

    it('should return true with 1 token picked when no other colours have tokens remaining', () => {
      const { result } = renderHook(() => useGameStore());

      // Only red has a token; all others are exhausted
      result.current.board.tokens = {
        red: 1,
        green: 0,
        blue: 0,
        white: 0,
        black: 0,
        gold: 5,
      };
      result.current.boardSnapshot.tokens = { ...result.current.board.tokens };

      act(() => result.current.pickToken('red'));
      // board.tokens.red is now 0 after the pick; all non-gold colours are 0

      expect(result.current.canEndTurn()).toBe(true);
    });

    it('should return true with 2 different tokens picked when no other colours have tokens remaining', () => {
      const { result } = renderHook(() => useGameStore());

      // Only red and green have tokens; blue/white/black are exhausted
      result.current.board.tokens = {
        red: 3,
        green: 3,
        blue: 0,
        white: 0,
        black: 0,
        gold: 5,
      };
      result.current.boardSnapshot.tokens = { ...result.current.board.tokens };

      act(() => result.current.pickToken('red'));
      act(() => result.current.pickToken('green'));
      // board still has red: 2, green: 2, but no unpicked colour has tokens

      expect(result.current.canEndTurn()).toBe(true);
    });

    it('should return false with 1 token picked when other colours still have tokens', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.pickToken('red'));

      // board still has green, blue, white, black tokens (normal deal)
      expect(result.current.canEndTurn()).toBe(false);
    });

    it('should return false with 2 different tokens picked when a third colour is still available', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.pickToken('red'));
      act(() => result.current.pickToken('green'));

      // board still has blue/white/black tokens (normal deal)
      expect(result.current.canEndTurn()).toBe(false);
    });

    it('should return false if no card or tokens are picked', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.canEndTurn()).toBe(false);
    });

    it('should return false if a card is picked but tokens are also picked', () => {
      const { result } = renderHook(() => useGameStore());

      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      result.current.pickedCard = { card, intent: 'buy', boardIndex: -1 };
      result.current.pickedTokens.red = 1;

      expect(result.current.canEndTurn()).toBe(false);
    });
  });

  describe('isForcedPass()', () => {
    it('returns false when tokens are available to take', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());

      // board has tokens after deal
      expect(result.current.isForcedPass()).toBe(false);
    });

    it('returns false when player has fewer than 3 reserved cards and a card on the board', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());

      result.current.board.tokens = {
        red: 0,
        green: 0,
        blue: 0,
        white: 0,
        black: 0,
        gold: 0,
      };

      expect(result.current.isForcedPass()).toBe(false);
    });

    it('returns false when player can afford a card', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());

      result.current.board.tokens = {
        red: 0,
        green: 0,
        blue: 0,
        white: 0,
        black: 0,
        gold: 0,
      };
      result.current.players[0].reservedCards = [
        {
          id: 'r1',
          cost: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
          prestige: 1,
          gem: 'red',
          level: 1,
        },
        {
          id: 'r2',
          cost: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
          prestige: 1,
          gem: 'green',
          level: 1,
        },
        {
          id: 'r3',
          cost: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
          prestige: 1,
          gem: 'blue',
          level: 1,
        },
      ];

      expect(result.current.isForcedPass()).toBe(false);
    });

    it('returns true when no tokens available, 3 cards reserved, and cannot afford any card', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());

      // Drain all tokens
      result.current.board.tokens = {
        red: 0,
        green: 0,
        blue: 0,
        white: 0,
        black: 0,
        gold: 0,
      };
      // Max reserved cards, all expensive
      result.current.players[0].reservedCards = [
        {
          id: 'r1',
          cost: { red: 5, green: 0, blue: 0, white: 0, black: 0 },
          prestige: 1,
          gem: 'red',
          level: 1,
        },
        {
          id: 'r2',
          cost: { red: 5, green: 0, blue: 0, white: 0, black: 0 },
          prestige: 1,
          gem: 'green',
          level: 1,
        },
        {
          id: 'r3',
          cost: { red: 5, green: 0, blue: 0, white: 0, black: 0 },
          prestige: 1,
          gem: 'blue',
          level: 1,
        },
      ];
      // Make all board cards unaffordable
      result.current.board.cards.level1 = [
        {
          id: 'b1',
          cost: { red: 5, green: 0, blue: 0, white: 0, black: 0 },
          prestige: 1,
          gem: 'red',
          level: 1,
        },
      ];
      result.current.board.cards.level2 = [];
      result.current.board.cards.level3 = [];
      result.current.deck = [];
      result.current.players[0].tokens = {
        red: 0,
        green: 0,
        blue: 0,
        white: 0,
        black: 0,
        gold: 0,
      };
      result.current.players[0].gems = {
        red: 0,
        green: 0,
        blue: 0,
        white: 0,
        black: 0,
      };

      expect(result.current.isForcedPass()).toBe(true);
      expect(result.current.canEndTurn()).toBe(true);
    });
  });

  describe('checkWinCondition()', () => {
    it('should return true if a player has 15 or more prestige points', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());

      const player = result.current.getCurrentPlayer();
      player.prestige = 15;

      act(() => result.current.checkWinCondition());

      expect(result.current.finalRoundTriggered).toBe(true);
      expect(result.current.finalRoundPlayer).toBe(0);
    });

    it('should return false if no player has 15 or more prestige points', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());

      const player = result.current.getCurrentPlayer();
      player.prestige = 14;

      act(() => result.current.checkWinCondition());

      expect(result.current.finalRoundTriggered).toBe(false);
      expect(result.current.finalRoundPlayer).toBeNull();
      expect(result.current.winner).toBeNull();
    });

    describe('game over — final round resolution', () => {
      // Helper: set up a 2-player game already in the final round
      // where currentPlayerIndex is 1 (so nextPlayerIndex === 0 === finalRoundPlayer)
      const setupFinalRound = () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(2));
        act(() => result.current.init());
        act(() => result.current.deal());
        act(() => result.current.setCurrentPlayerIndex(1));

        // Mark the final round as already triggered by player 0
        result.current.finalRoundTriggered = true;
        result.current.finalRoundPlayer = 0;

        return result;
      };

      it('sets isGameOver to true when the final round completes', () => {
        const result = setupFinalRound();

        result.current.players[0].prestige = 16;
        result.current.players[1].prestige = 10;

        act(() => result.current.checkWinCondition());

        expect(result.current.isGameOver).toBe(true);
      });

      it('sets winner to the player with the highest prestige', () => {
        const result = setupFinalRound();

        result.current.players[0].prestige = 18;
        result.current.players[1].prestige = 12;

        act(() => result.current.checkWinCondition());

        expect(result.current.winner?.uuid).toBe(
          result.current.players[0].uuid,
        );
      });

      it('uses the tiebreaker (fewest cards) when prestige is equal', () => {
        const result = setupFinalRound();

        result.current.players[0].prestige = 15;
        result.current.players[0].cards = Array(4).fill({
          id: 'x',
          cost: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
          prestige: 0,
          gem: 'red',
          level: 1,
        });

        result.current.players[1].prestige = 15;
        result.current.players[1].cards = Array(3).fill({
          id: 'y',
          cost: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
          prestige: 0,
          gem: 'blue',
          level: 1,
        });

        act(() => result.current.checkWinCondition());

        // Player 1 has fewer cards → wins the tiebreaker
        expect(result.current.winner?.uuid).toBe(
          result.current.players[1].uuid,
        );
        expect(result.current.isGameOver).toBe(true);
      });

      it('sets winner to null on a true tie (same prestige and same card count)', () => {
        const result = setupFinalRound();

        result.current.players[0].prestige = 15;
        result.current.players[0].cards = Array(3).fill({
          id: 'x',
          cost: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
          prestige: 0,
          gem: 'red',
          level: 1,
        });

        result.current.players[1].prestige = 15;
        result.current.players[1].cards = Array(3).fill({
          id: 'y',
          cost: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
          prestige: 0,
          gem: 'blue',
          level: 1,
        });

        act(() => result.current.checkWinCondition());

        expect(result.current.isGameOver).toBe(true);
        expect(result.current.winner).toBeNull();
      });

      it('does not end the game early — no isGameOver when not yet back to finalRoundPlayer', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(2));
        act(() => result.current.init());
        act(() => result.current.deal());

        // Player 0 triggers final round; next player is 1, not 0
        result.current.finalRoundTriggered = true;
        result.current.finalRoundPlayer = 0;
        act(() => result.current.setCurrentPlayerIndex(0));

        result.current.players[0].prestige = 16;
        result.current.players[1].prestige = 10;

        act(() => result.current.checkWinCondition());

        expect(result.current.isGameOver).toBe(false);
      });

      it('includes all three players in tiedPlayers on a 3-way tie (same prestige, same card count)', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(4));
        act(() => result.current.init());
        act(() => result.current.deal());
        // currentPlayerIndex = 3 → nextPlayerIndex = 0 = finalRoundPlayer
        act(() => result.current.setCurrentPlayerIndex(3));

        result.current.finalRoundTriggered = true;
        result.current.finalRoundPlayer = 0;

        const makeCards = (count: number) =>
          Array(count).fill({
            id: 'x',
            cost: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
            prestige: 0,
            gem: 'red' as const,
            level: 1,
          });

        result.current.players[0].prestige = 15;
        result.current.players[0].cards = makeCards(3);
        result.current.players[1].prestige = 15;
        result.current.players[1].cards = makeCards(3);
        result.current.players[2].prestige = 15;
        result.current.players[2].cards = makeCards(3);
        result.current.players[3].prestige = 10;
        result.current.players[3].cards = makeCards(2);

        act(() => result.current.checkWinCondition());

        expect(result.current.isGameOver).toBe(true);
        expect(result.current.winner).toBeNull();
        expect(result.current.tiedPlayers).toHaveLength(3);
        const tiedUuids = result.current.tiedPlayers.map((p) => p.uuid);
        expect(tiedUuids).toContain(result.current.players[0].uuid);
        expect(tiedUuids).toContain(result.current.players[1].uuid);
        expect(tiedUuids).toContain(result.current.players[2].uuid);
      });

      it('includes all four players in tiedPlayers on a 4-way tie', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(4));
        act(() => result.current.init());
        act(() => result.current.deal());
        act(() => result.current.setCurrentPlayerIndex(3));

        result.current.finalRoundTriggered = true;
        result.current.finalRoundPlayer = 0;

        const makeCards = (count: number) =>
          Array(count).fill({
            id: 'x',
            cost: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
            prestige: 0,
            gem: 'red' as const,
            level: 1,
          });

        result.current.players[0].prestige = 15;
        result.current.players[0].cards = makeCards(3);
        result.current.players[1].prestige = 15;
        result.current.players[1].cards = makeCards(3);
        result.current.players[2].prestige = 15;
        result.current.players[2].cards = makeCards(3);
        result.current.players[3].prestige = 15;
        result.current.players[3].cards = makeCards(3);

        act(() => result.current.checkWinCondition());

        expect(result.current.isGameOver).toBe(true);
        expect(result.current.winner).toBeNull();
        expect(result.current.tiedPlayers).toHaveLength(4);
      });

      it('middle player is not dropped from tiedPlayers in a 3-way prestige+card tie', () => {
        // Regression: previously tiedIndexes = [winnerIndex, index] overwrote the list,
        // causing the middle tied player to be lost.
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(4));
        act(() => result.current.init());
        act(() => result.current.deal());
        act(() => result.current.setCurrentPlayerIndex(3));

        result.current.finalRoundTriggered = true;
        result.current.finalRoundPlayer = 0;

        const makeCards = (count: number) =>
          Array(count).fill({
            id: 'x',
            cost: { red: 0, green: 0, blue: 0, white: 0, black: 0 },
            prestige: 0,
            gem: 'red' as const,
            level: 1,
          });

        // Players 0, 1, 2 all tied; player 3 loses badly
        result.current.players[0].prestige = 15;
        result.current.players[0].cards = makeCards(3);
        result.current.players[1].prestige = 15;
        result.current.players[1].cards = makeCards(3);
        result.current.players[2].prestige = 15;
        result.current.players[2].cards = makeCards(3);
        result.current.players[3].prestige = 5;
        result.current.players[3].cards = makeCards(1);

        act(() => result.current.checkWinCondition());

        const tiedUuids = result.current.tiedPlayers.map((p) => p.uuid);
        // All three tied players must be present — player 1 (the "middle" one) must not be dropped
        expect(tiedUuids).toContain(result.current.players[1].uuid);
        expect(result.current.tiedPlayers).toHaveLength(3);
      });
    });
  });

  describe('endTurn()', () => {
    it('should advance to the next player when tokens are within limit', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      act(() => result.current.pickToken('red'));
      act(() => result.current.pickToken('green'));
      act(() => result.current.pickToken('blue'));
      act(() => result.current.endTurn());

      expect(result.current.currentPlayerIndex).toBe(1);
    });

    it('should NOT advance to the next player when tokens exceed 10', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      // Give player 9 tokens so picking 2 more triggers over-limit
      result.current.players[0].tokens = {
        red: 3,
        green: 3,
        blue: 3,
        white: 0,
        black: 0,
        gold: 0,
      };

      act(() => result.current.pickToken('white'));
      act(() => result.current.pickToken('black'));
      act(() => result.current.endTurn());

      // Turn must not have advanced
      expect(result.current.currentPlayerIndex).toBe(0);
      expect(result.current.needToReturnTokens).toBe(true);
    });

    it('should commit a picked card during endTurn', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      const card: Card = {
        id: 'mockUuid-endturn',
        cost: { red: 0, green: 0, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.pickCard(card));
      act(() => result.current.endTurn());

      expect(result.current.players[0].cards).toContainEqual(card);
      expect(result.current.currentPlayerIndex).toBe(1);
    });
  });

  describe('returnToken() — over-limit flow', () => {
    it('should remove a token from the player and return it to the board', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].tokens = {
        red: 3,
        green: 3,
        blue: 3,
        white: 0,
        black: 0,
        gold: 0,
      };

      act(() => result.current.pickToken('white'));
      act(() => result.current.pickToken('black'));
      act(() => result.current.endTurn()); // triggers over-limit, stays on player 0

      const boardRedBefore = result.current.board.tokens.red;

      act(() => result.current.returnToken('red'));

      expect(result.current.players[0].tokens.red).toBe(2);
      expect(result.current.board.tokens.red).toBe(boardRedBefore + 1);
    });

    it('should advance the turn after the last excess token is returned', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].tokens = {
        red: 3,
        green: 3,
        blue: 3,
        white: 0,
        black: 0,
        gold: 0,
      };

      act(() => result.current.pickToken('white'));
      act(() => result.current.pickToken('black'));
      act(() => result.current.endTurn()); // over-limit, tokensToReturn = 1

      expect(result.current.currentPlayerIndex).toBe(0);

      act(() => result.current.returnToken('red')); // returns the 1 excess token

      // Turn should now have advanced
      expect(result.current.needToReturnTokens).toBe(false);
      expect(result.current.currentPlayerIndex).toBe(1);
    });

    it('should keep needToReturnTokens true until all excess tokens are returned', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      // 10 tokens already; picking 2 more gives total 12 → must return 2
      result.current.players[0].tokens = {
        red: 4,
        green: 3,
        blue: 3,
        white: 0,
        black: 0,
        gold: 0,
      };

      act(() => result.current.pickToken('white'));
      act(() => result.current.pickToken('black'));
      act(() => result.current.endTurn()); // tokensToReturn = 2

      expect(result.current.needToReturnTokens).toBe(true);
      expect(result.current.tokensToReturn).toBe(2);

      act(() => result.current.returnToken('red'));

      expect(result.current.needToReturnTokens).toBe(true);
      expect(result.current.tokensToReturn).toBe(1);
      expect(result.current.currentPlayerIndex).toBe(0); // still waiting

      act(() => result.current.returnToken('red'));

      expect(result.current.needToReturnTokens).toBe(false);
      expect(result.current.currentPlayerIndex).toBe(1); // now advanced
    });
  });

  describe('reserveFromDeck()', () => {
    const setup = () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());
      act(() => result.current.setCurrentPlayerIndex(0));

      return result;
    };

    it('adds a card from the correct level to the player reserved cards', () => {
      const result = setup();
      const deckBefore = result.current.deck.filter((c) => c.level === 1);

      act(() => result.current.reserveFromDeck(1));

      const player = result.current.getCurrentPlayer();
      expect(player.reservedCards.length).toBe(1);
      expect(player.reservedCards[0].level).toBe(1);
      expect(deckBefore.some((c) => c.id === player.reservedCards[0].id)).toBe(
        true,
      );
    });

    it('removes the reserved card from the deck', () => {
      const result = setup();
      const deckSizeBefore = result.current.deck.filter(
        (c) => c.level === 2,
      ).length;

      act(() => result.current.reserveFromDeck(2));

      const player = result.current.getCurrentPlayer();
      const reservedId = player.reservedCards[0].id;
      const deckSizeAfter = result.current.deck.filter(
        (c) => c.level === 2,
      ).length;

      expect(deckSizeAfter).toBe(deckSizeBefore - 1);
      expect(result.current.deck.some((c) => c.id === reservedId)).toBe(false);
    });

    it('awards a gold token to the player when one is available', () => {
      const result = setup();
      const goldBefore = result.current.getCurrentPlayer().tokens.gold;
      const boardGoldBefore = result.current.board.tokens.gold;

      act(() => result.current.reserveFromDeck(3));

      const player = result.current.getCurrentPlayer();
      expect(player.tokens.gold).toBe(goldBefore + 1);
      expect(result.current.board.tokens.gold).toBe(boardGoldBefore - 1);
    });

    it('does not award a gold token when none are on the board', () => {
      const result = setup();
      result.current.board.tokens.gold = 0;

      const goldBefore = result.current.getCurrentPlayer().tokens.gold;

      act(() => result.current.reserveFromDeck(1));

      expect(result.current.getCurrentPlayer().tokens.gold).toBe(goldBefore);
      expect(result.current.board.tokens.gold).toBe(0);
    });

    it('does not allow reserving when player already has 3 reserved cards', () => {
      const result = setup();

      // Give the player 3 reserved cards
      const cards = result.current.deck
        .filter((c) => c.level === 1)
        .slice(0, 3);
      result.current.players[0].reservedCards = cards;

      const deckSizeBefore = result.current.deck.length;

      act(() => result.current.reserveFromDeck(1));

      expect(result.current.players[0].reservedCards.length).toBe(3);
      expect(result.current.deck.length).toBe(deckSizeBefore);
    });

    it('does not reserve when the deck for that level is empty', () => {
      const result = setup();

      // Remove all level 3 cards from the deck
      result.current.deck = result.current.deck.filter((c) => c.level !== 3);

      const reservedBefore =
        result.current.getCurrentPlayer().reservedCards.length;

      act(() => result.current.reserveFromDeck(3));

      expect(result.current.getCurrentPlayer().reservedCards.length).toBe(
        reservedBefore,
      );
    });

    it('sets needToReturnTokens when the gold award pushes player over 10 tokens', () => {
      const result = setup();

      // Give player exactly 10 tokens; getting gold will push to 11
      result.current.players[0].tokens = {
        red: 2,
        green: 2,
        blue: 2,
        white: 2,
        black: 2,
        gold: 0,
      };

      act(() => result.current.reserveFromDeck(1));

      expect(result.current.needToReturnTokens).toBe(true);
      expect(result.current.tokensToReturn).toBe(1);
    });

    it('does not set needToReturnTokens when player stays at or below 10 tokens', () => {
      const result = setup();

      // Player has 9 tokens; getting gold brings them to 10 (exactly at limit)
      result.current.players[0].tokens = {
        red: 2,
        green: 2,
        blue: 2,
        white: 2,
        black: 1,
        gold: 0,
      };

      act(() => result.current.reserveFromDeck(1));

      expect(result.current.needToReturnTokens).toBe(false);
      expect(result.current.tokensToReturn).toBe(0);
    });
  });
});
