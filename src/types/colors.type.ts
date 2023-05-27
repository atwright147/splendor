export const Colors = {
  Black: 'black',
  Blue: 'blue',
  Green: 'green',
  Red: 'red',
  White: 'white',
} as const;

export type ColorKeys = typeof Colors[keyof typeof Colors];
