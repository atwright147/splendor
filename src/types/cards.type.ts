import type { ColorsType } from './colors.type';

export interface Price {
  color: ColorsType,
  quantity: number,
}

export interface Card {
  level: number,
  gemColor: ColorsType,
  price: Price[],
  gemQuantity: number,
}
