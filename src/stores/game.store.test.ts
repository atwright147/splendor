import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Card, Noble, Token, Tokens, useGameStore } from './game.store';

describe('Game Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.setCurrentPlayerIndex(0);
      result.current.resetBoardSnapshot();
    });
  });

  describe('setCurrentPlayerIndex()', () => {
    it('sets the current player index', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setCurrentPlayerIndex(2);
      });

      expect(result.current.currentPlayerIndex).toBe(2);
    });
  });

  describe('createPlayers()', () => {
    it('creates players', () => {
      const { result } = renderHook(() => useGameStore());
      const quantity = 4;

      expect(result.current.players.length).toBe(0);

      act(() => {
        result.current.createPlayers(quantity);
      });

      expect(result.current.players.length).toBe(quantity);
    });

    it('does not create more than 4 players', () => {
      vi.spyOn(console, 'info').mockImplementation(() => {});

      const { result } = renderHook(() => useGameStore());
      const quantity = 5;

      act(() => {
        result.current.createPlayers(quantity);
      });

      expect(result.current.players.length).toBe(4);
    });
  });

  describe('reserveToken()', () => {
    let defaultTokens: Tokens;
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());

      defaultTokens = {
        red: 0,
        blue: 0,
        green: 0,
        white: 0,
        black: 0,
        gold: 0,
      };

      result.current.reservedTokens = defaultTokens;
    });

    it('reserves a token when no tokens are reserved and available tokens are not less than 4', () => {
      vi.spyOn(console, 'info').mockImplementation(() => {});

      const { result } = renderHook(() => useGameStore());
      const tokenColor = 'red';
      result.current.boardSnapshot.tokens[tokenColor] = 4;

      act(() => {
        result.current.reserveToken(tokenColor);
      });

      expect(result.current.reservedTokens[tokenColor]).toBe(1);
    });

    it('given 4 tokens of the same color are on the board and no other tokens are reserved, should reserve 2 tokens of the same color', () => {
      const { result } = renderHook(() => useGameStore());
      const tokenColor = 'red';
      const token1 = tokenColor;
      const token2 = tokenColor;

      result.current.boardSnapshot.tokens[tokenColor] = 4;

      act(() => {
        result.current.reserveToken(token1);
        result.current.reserveToken(token2);
      });

      expect(result.current.reservedTokens[tokenColor]).toBe(2);
    });

    it('given 4 tokens of the same color are on the board and tokens of other colors are reserved, should not reserve a second token', () => {
      const { result } = renderHook(() => useGameStore());
      const tokenColor = 'red';
      const otherTokenColor = 'blue';
      const token1 = tokenColor;
      const token2 = otherTokenColor;
      const token3 = tokenColor;

      result.current.boardSnapshot.tokens[tokenColor] = 4;
      result.current.boardSnapshot.tokens[otherTokenColor] = 4;

      act(() => {
        result.current.reserveToken(token1);
      });

      act(() => {
        result.current.reserveToken(token2);
      });

      act(() => {
        result.current.reserveToken(token3);
      });

      console.info(result.current.reservedTokens);
      expect(result.current.reservedTokens[tokenColor]).toBe(1);
    });

    it.skip('reserves a token when a token of a different color is already reserved', () => {
      const { result } = renderHook(() => useGameStore());
      const token1 = 'red';
      const token2 = 'blue';
      act(() => {
        result.current.reserveToken(token1);
        result.current.reserveToken(token2);
      });
      expect(result.current.reservedTokens).toContain(token1);
      expect(result.current.reservedTokens).toContain(token2);
    });

    it.skip('does not reserve a token when a token of the same color is already reserved and other tokens are reserved', () => {
      const { result } = renderHook(() => useGameStore());
      const token1 = 'red';
      const token2 = 'blue';
      const token3 = 'red';
      act(() => {
        result.current.reserveToken(token1);
        result.current.reserveToken(token2);
        result.current.reserveToken(token3);
      });
      expect(result.current.reservedTokens).toContain(token1);
      expect(result.current.reservedTokens).toContain(token2);
      expect(result.current.reservedTokens).not.toContain(token3);
    });

    it('does not reserve a token when the available tokens are less than 4', () => {
      const { result } = renderHook(() => useGameStore());
      const token = 'red';
      // simulate available tokens being less than 4
      result.current.board.tokens.red = 3;
      act(() => {
        result.current.reserveToken(token);
      });
      expect(result.current.reservedTokens).not.toContain(token);
    });
  });

  describe('takeCard()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());
      const quantity = 2;

      act(() => {
        result.current.createPlayers(quantity);
      });
    });

    it("adds card to current player's hand", () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2 },
        prestige: 1,
        token: 'red',
        level: 1,
      };

      act(() => {
        result.current.setCurrentPlayerIndex(0);
        result.current.takeCard(card);
      });

      expect(result.current.players[0].cards).toContain(card);
    });

    it("adds multiple cards to current player's hand", () => {
      const { result } = renderHook(() => useGameStore());
      const card1: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2 },
        prestige: 1,
        token: 'red',
        level: 1,
      };

      const card2: Card = {
        id: 'mockUuid-2',
        cost: { blue: 2, white: 1 },
        prestige: 2,
        token: 'green',
        level: 1,
      };

      act(() => {
        result.current.setCurrentPlayerIndex(0);
        result.current.takeCard(card1);
        result.current.takeCard(card2);
      });

      expect(result.current.players[0].cards).toContain(card1);
      expect(result.current.players[0].cards).toContain(card2);
    });
  });

  describe('reserveCard()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.createPlayers(2);
      });
    });

    it('reserves a card for the current player', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2 },
        prestige: 1,
        token: 'red',
        level: 1,
      };

      act(() => {
        result.current.reserveCard(card);
      });

      expect(result.current.players[0].reservedCards).toContain(card);
    });

    it('reserves a card when there are multiple players', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2 },
        prestige: 1,
        token: 'red',
        level: 1,
      };

      act(() => {
        result.current.setCurrentPlayerIndex(1);
        result.current.reserveCard(card);
      });

      expect(result.current.players[1].reservedCards).toContain(card);
    });

    it('does not reserve a card when the card is already reserved by the current player', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const PLAYER_INDEX = 1;
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2 },
        prestige: 1,
        token: 'red',
        level: 1,
      };

      act(() => {
        result.current.setCurrentPlayerIndex(PLAYER_INDEX);
        result.current.reserveCard(card);
        result.current.reserveCard(card);
      });

      expect(result.current.players[PLAYER_INDEX].reservedCards.length).toBe(1);
    });
  });

  describe.skip('claimNoble()', () => {
    it('should update the current player with the noble prestige and add the noble to the nobles list', () => {
      const { result } = renderHook(() => useGameStore());
      const noble: Noble = {
        id: '1',
        prestige: 10,
        cost: { red: 1, green: 1, blue: 1 },
      };

      act(() => {
        result.current.claimNoble(noble);
      });

      expect(
        result.current.players[result.current.currentPlayerIndex].prestige,
      ).toBe(10);
      expect(
        result.current.players[result.current.currentPlayerIndex].nobles,
      ).toContainEqual(noble);
    });

    // it('should remove the noble from the nobles list', () => {
    //   const { result } = renderHook(() => useGameStore());
    //   const noble: Noble = {
    //     id: '1',
    //     prestige: 10,
    //     cost: { red: 1, green: 1, blue: 1 },
    //   };

    //   act(() => {
    //     result.current.claimNoble(noble);
    //   });

    //   expect(result.current.nobles).not.toContainEqual(noble);
    // });

    it('should not update other players', () => {
      const { result } = renderHook(() => useGameStore());
      const noble: Noble = {
        id: '1',
        prestige: 10,
        cost: { red: 1, green: 1, blue: 1 },
      };

      act(() => {
        result.current.claimNoble(noble);
      });

      const otherPlayerIndex =
        (result.current.currentPlayerIndex + 1) % result.current.players.length;

      expect(result.current.players[otherPlayerIndex].prestige).toBe(0);
      expect(
        result.current.players[otherPlayerIndex].nobles,
      ).not.toContainEqual(noble);
    });
  });

  describe('nextPlayer()', () => {
    it('selects the next player when there are multiple players', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.createPlayers(3);
      });

      expect(result.current.currentPlayerIndex).toBe(0);

      act(() => {
        result.current.nextPlayer();
      });

      expect(result.current.currentPlayerIndex).toBe(1);
    });

    it('wraps around to the first player when current player is the last player', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.createPlayers(3);
      });

      expect(result.current.currentPlayerIndex).toBe(0);

      act(() => {
        result.current.nextPlayer();
        result.current.nextPlayer();
        result.current.nextPlayer();
      });

      expect(result.current.currentPlayerIndex).toBe(0);
    });

    it('does not change when there is only one player', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.createPlayers(1);
      });

      expect(result.current.currentPlayerIndex).toBe(0);

      act(() => {
        result.current.nextPlayer();
      });

      expect(result.current.currentPlayerIndex).toBe(0);
    });

    it('should update `boardSnapshot` state', () => {
      const { result } = renderHook(() => useGameStore());

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

      act(() => {
        result.current.createPlayers(2);
      });

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

      act(() => {
        result.current.nextPlayer();
      });

      expect(result.current.boardSnapshot).toEqual(result.current.board);
    });
  });
});
