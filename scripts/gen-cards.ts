/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from 'node:fs';
import path from 'node:path';

import type { Card } from '../src/types/cards.type';
import type { ColorKeys } from '../src/types/colors.type';

const numberOrZero = (num: string): number => {
  return +num || 0;
}

const cardsCsv = fs.readFileSync(path.resolve('ref', 'cards.csv'));
const cardLines = cardsCsv.toString().split('\n').slice(2);
const cards: Card[] = [];
let currentLevel: string;
let currentGemColor: ColorKeys;
let currentGemQuantity: string;

for (const cardLine of cardLines) {
  const [
    level,
    gemColor,
    gemQuantity, // pv
    priceVerbose,
    illustration,
    priceWhite,
    priceBlue,
    priceGreen,
    priceRed,
    priceBlack,
  ] = cardLine.split(',');

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  currentLevel = level?.length ? level : currentLevel!;
  currentGemColor = gemColor?.length ? gemColor as ColorKeys : currentGemColor!;
  currentGemQuantity = gemQuantity?.length ? gemQuantity : currentGemQuantity!;
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  const card: Card = {
    level: numberOrZero(currentLevel),
    gemColor: currentGemColor,
    price: [
      {
        color: 'black',
        quantity: numberOrZero(priceBlack || '0')
      },
      {
        color: 'blue',
        quantity: numberOrZero(priceBlue || '0')
      },
      {
        color: 'red',
        quantity: numberOrZero(priceRed || '0')
      },
      {
        color: 'green',
        quantity: numberOrZero(priceGreen || '0')
      },
      {
        color: 'white',
        quantity: numberOrZero(priceWhite || '0')
      },
    ],
    gemQuantity: +currentGemQuantity,
  };

  cards.push(card);
}

fs.writeFileSync(path.resolve('ref', 'cards.json'), JSON.stringify(cards, null, 2));
