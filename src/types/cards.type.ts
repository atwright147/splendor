import type { ColorKeys } from './colors.type';

export interface Price {
  color: ColorKeys,
  quantity: number,
}

export interface Card {
  level: number,
  gemColor: ColorKeys,
  price: Price[],
  gemQuantity: number,
}
