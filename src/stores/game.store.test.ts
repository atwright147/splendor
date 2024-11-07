import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tokens, useGameStore } from './game.store';

describe('setTokens', () => {
  it('sets tokens for a specific player', () => {
    const { result } = renderHook(() => useGameStore());
    const initialPlayers = result.current.players;
    const playerIndex = 0;
    const newTokens: Tokens = { red: 1, green: 2, blue: 3 };

    act(() => {
      result.current.setTokens(playerIndex, newTokens);
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
      result.current.setTokens(playerIndex, newTokens);
    });

    expect(result.current.players).toBe(initialPlayers);
  });

  it('throws an error for invalid player index', () => {
    const { result } = renderHook(() => useGameStore());
    const playerIndex = -1;
    const newTokens = { red: 1, green: 2, blue: 3 };

    expect(() => {
      act(() => {
        result.current.setTokens(playerIndex, newTokens);
      });
    }).toThrowError();
  });

  it('sets tokens with empty tokens object', () => {
    const { result } = renderHook(() => useGameStore());
    const playerIndex = 0;
    const newTokens = {};

    act(() => {
      result.current.setTokens(playerIndex, newTokens);
    });

    expect(result.current.players[playerIndex].tokens).toEqual(newTokens);
  });

  it('sets tokens with partial tokens object', () => {
    const { result } = renderHook(() => useGameStore());
    const playerIndex = 0;
    const newTokens = { red: 1 };

    act(() => {
      result.current.setTokens(playerIndex, newTokens);
    });

    expect(result.current.players[playerIndex].tokens).toEqual({
      ...result.current.players[playerIndex].tokens,
      ...newTokens,
    });
  });
});
