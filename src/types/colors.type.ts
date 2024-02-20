export const GemColors = {
  Black: 'black',
  Blue: 'blue',
  Green: 'green',
  Red: 'red',
  White: 'white',
} as const;

export type GemColorKeys = keyof typeof GemColors;
export type GemColorValues = (typeof GemColors)[keyof typeof GemColors];

export const TokenColors = {
  Black: 'black',
  Blue: 'blue',
  Gold: 'gold',
  Green: 'green',
  Red: 'red',
  White: 'white',
} as const;

export type TokenColorKeys = keyof typeof TokenColors;
export type TokenColorValues = (typeof TokenColors)[keyof typeof TokenColors];
