import type { GemColors, Gems } from '../stores/game.store';

export const addGem = (playerGems: Gems, color: GemColors): Gems => {
  return {
    ...playerGems,
    [color]: playerGems[color] + 1,
  };
};
