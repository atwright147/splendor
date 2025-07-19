import type { Tokens } from '../stores/game.store';

export const mergeTokens = (tokens1: Tokens, tokens2: Tokens): Tokens => ({
  red: (tokens1.red ?? 0) + (tokens2.red ?? 0),
  green: (tokens1.green ?? 0) + (tokens2.green ?? 0),
  blue: (tokens1.blue ?? 0) + (tokens2.blue ?? 0),
  white: (tokens1.white ?? 0) + (tokens2.white ?? 0),
  black: (tokens1.black ?? 0) + (tokens2.black ?? 0),
  gold: (tokens1.gold ?? 0) + (tokens2.gold ?? 0),
});
