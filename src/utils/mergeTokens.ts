import type { Tokens } from '../stores/game.store';

export const mergeTokens = (tokens1: Tokens, tokens2: Tokens): Tokens => ({
  red: tokens1.red + tokens2.red,
  green: tokens1.green + tokens2.green,
  blue: tokens1.blue + tokens2.blue,
  white: tokens1.white + tokens2.white,
  black: tokens1.black + tokens2.black,
  gold: tokens1.gold + tokens2.gold,
});
