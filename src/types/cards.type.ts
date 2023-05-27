import type { GemColorValues } from './colors.type';

export interface Price {
  color: GemColorValues,
  quantity: number,
}

export interface Card {
  level: number,
  gemColor: GemColorValues,
  price: Price[],
  gemQuantity: number,
}
