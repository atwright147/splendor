import { Price } from './cards.type';
import { Uuid } from './utils.types';

export interface Noble {
  id: Uuid,
  price: Price[],
  prestige: number,
}
