import { Price } from './cards.type';
import { Uuid } from './utils.types';

export interface Noble {
  id: number,
  price: Price[],
  prestige: number,
}
