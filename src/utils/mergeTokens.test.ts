import { describe, expect, it } from 'vitest';

import type { Tokens } from '../stores/game.store';
import { mergeTokens } from './mergeTokens';

describe('mergeTokens()', () => {
  it('should merge two token objects correctly', () => {
    const tokens1: Tokens = {
      red: 1,
      green: 2,
      blue: 3,
      white: 4,
      black: 5,
      gold: 6,
    };
    const tokens2: Tokens = {
      red: 2,
      green: 3,
      blue: 4,
      white: 5,
      black: 6,
      gold: 7,
    };

    const result = mergeTokens(tokens1, tokens2);

    expect(result).toEqual({
      red: 3,
      green: 5,
      blue: 7,
      white: 9,
      black: 11,
      gold: 13,
    });
  });

  it('should handle missing properties by treating them as 0', () => {
    const tokens1: Tokens = { red: 1, green: 2 };
    const tokens2: Tokens = { blue: 3, white: 4 };

    const result = mergeTokens(tokens1, tokens2);

    expect(result).toEqual({
      red: 1,
      green: 2,
      blue: 3,
      white: 4,
      black: 0,
      gold: 0,
    });
  });

  it('should handle empty objects', () => {
    const tokens1: Tokens = {};
    const tokens2: Tokens = {};

    const result = mergeTokens(tokens1, tokens2);

    expect(result).toEqual({
      red: 0,
      green: 0,
      blue: 0,
      white: 0,
      black: 0,
      gold: 0,
    });
  });

  it('should handle one empty and one populated object', () => {
    const tokens1: Tokens = {};
    const tokens2: Tokens = {
      red: 2,
      green: 3,
      blue: 4,
      white: 5,
      black: 6,
      gold: 7,
    };

    const result = mergeTokens(tokens1, tokens2);

    expect(result).toEqual({
      red: 2,
      green: 3,
      blue: 4,
      white: 5,
      black: 6,
      gold: 7,
    });
  });
});
