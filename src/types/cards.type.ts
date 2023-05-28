import type { GemColorValues } from './colors.type';
import { Uuid } from './utils.types';

export interface Price {
  color: GemColorValues,
  quantity: number,
}

export interface Card {
  id: Uuid,
  level: number,
  gemColor: GemColorValues,
  price: Price[],
  gemQuantity: number,
}
