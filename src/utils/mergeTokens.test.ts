import { describe, expect, it } from 'vitest';

import type { TokensWithGold } from '../stores/game.store';
import { mergeTokens } from './mergeTokens';

describe('mergeTokens()', () => {
  it('should merge two token objects correctly', () => {
    const tokens1: TokensWithGold = {
      red: 1,
      green: 2,
      blue: 3,
      white: 4,
      black: 5,
      gold: 6,
    };
    const tokens2: TokensWithGold = {
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
});
