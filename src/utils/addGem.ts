import type { TokenColor, Tokens } from '../stores/game.store';

export const addGem = (playerGems: Tokens, color: TokenColor): Tokens => {
  return {
    ...playerGems,
    [color]: playerGems[color] + 1,
  };
};
