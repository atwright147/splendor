import { describe, expect, it } from 'vitest';

import type { Tokens } from '../stores/game.store';
import { addGem } from './addGem';

describe('addGem()', () => {
  it('should add a gem to the specified color', () => {
    const gems: Tokens = {
      red: 0,
      green: 0,
      blue: 0,
      white: 0,
      black: 0,
      gold: 0,
    };

    const result = addGem(gems, 'red');

    expect(result).toEqual({
      red: 1,
      green: 0,
      blue: 0,
      white: 0,
      black: 0,
      gold: 0,
    });
  });
});
