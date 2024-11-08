import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Card, Noble, Tokens, useGameStore } from './game.store';

describe('Game Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.setCurrentPlayerIndex(0);
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

  describe('setTokens()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());
      const quantity = 4;

      act(() => {
        result.current.createPlayers(quantity);
      });
    });

    it('sets tokens for a specific player', () => {
      const { result } = renderHook(() => useGameStore());
      const initialPlayers = result.current.players;
      const playerIndex = 0;
      const newTokens: Tokens = { red: 1, green: 2, blue: 3 };

      act(() => {
        result.current.setCurrentPlayerIndex(playerIndex);
        result.current.setTokens(newTokens);
      });

      expect(result.current.players[playerIndex].tokens).toEqual(newTokens);
      expect(result.current.players).not.toBe(initialPlayers);
    });

    it('does not set tokens for a non-existent player', () => {
      const { result } = renderHook(() => useGameStore());
      const initialPlayers = result.current.players;
      const playerIndex = 5;
      const newTokens = { red: 1, green: 2, blue: 3 };

      act(() => {
        result.current.setCurrentPlayerIndex(playerIndex);
        result.current.setTokens(newTokens);
      });

      expect(result.current.players).toStrictEqual(initialPlayers);
    });

    it('sets tokens with empty tokens object', () => {
      const { result } = renderHook(() => useGameStore());
      const playerIndex = 0;
      const newTokens = {};

      act(() => {
        result.current.setCurrentPlayerIndex(playerIndex);
        result.current.setTokens(newTokens);
      });

      expect(result.current.players[playerIndex].tokens).toEqual(newTokens);
    });

    it('sets tokens with partial tokens object', () => {
      const { result } = renderHook(() => useGameStore());
      const playerIndex = 0;
      const newTokens = { red: 1 };

      act(() => {
        result.current.setCurrentPlayerIndex(playerIndex);
        result.current.setTokens(newTokens);
      });

      expect(result.current.players[playerIndex].tokens).toEqual({
        ...result.current.players[playerIndex].tokens,
        ...newTokens,
      });
    });
  });

  describe('addCard()', () => {
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
      };

      act(() => {
        result.current.setCurrentPlayerIndex(0);
        result.current.addCard(card);
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
      };

      const card2: Card = {
        id: 'mockUuid-2',
        cost: { blue: 2, white: 1 },
        prestige: 2,
        token: 'green',
      };

      act(() => {
        result.current.setCurrentPlayerIndex(0);
        result.current.addCard(card1);
        result.current.addCard(card2);
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
      };

      act(() => {
        result.current.setCurrentPlayerIndex(PLAYER_INDEX);
        result.current.reserveCard(card);
        result.current.reserveCard(card);
      });

      expect(result.current.players[PLAYER_INDEX].reservedCards.length).toBe(1);
    });
  });

  describe('claimNoble()', () => {
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

    it('should remove the noble from the nobles list', () => {
      const { result } = renderHook(() => useGameStore());
      const noble: Noble = {
        id: '1',
        prestige: 10,
        cost: { red: 1, green: 1, blue: 1 },
      };

      act(() => {
        result.current.claimNoble(noble);
      });

      expect(result.current.nobles).not.toContainEqual(noble);
    });

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
  });
});
