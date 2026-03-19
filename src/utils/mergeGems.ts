import type { Gems } from '#stores/game.store';

export const mergeGems = (gems1: Gems, gems2: Gems): Gems => ({
  red: gems1.red + gems2.red,
  green: gems1.green + gems2.green,
  blue: gems1.blue + gems2.blue,
  white: gems1.white + gems2.white,
  black: gems1.black + gems2.black,
});
