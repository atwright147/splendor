import { describe, expect, it } from 'vitest';

import type { Gems } from '../stores/game.store';
import { mergeGems } from './mergeGems';

describe('mergeGems()', () => {
  it('should merge two gem objects correctly', () => {
    const gems1: Gems = {
      red: 1,
      green: 2,
      blue: 3,
      white: 4,
      black: 5,
    };
    const gems2: Gems = {
      red: 2,
      green: 3,
      blue: 4,
      white: 5,
      black: 6,
    };

    const result = mergeGems(gems1, gems2);

    expect(result).toEqual<Gems>({
      red: 3,
      green: 5,
      blue: 7,
      white: 9,
      black: 11,
    });
  });
});
