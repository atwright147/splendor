import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

import type { Card } from '../src/types/cards.type';
import type { GemColorValues } from '../src/types/colors.type';

const numberOrZero = (num: string): number => {
  return +num || 0;
};

const cardsCsv = fs.readFileSync(path.resolve('ref', 'cards.csv'));
const cardLines = cardsCsv.toString().split('\n').slice(2);
const cards: Card[] = [];
let currentLevel: string;
let currentGemColor: GemColorValues;
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

  // biome-ignore lint/style/noNonNullAssertion: necessary
  currentLevel = level?.length ? level : currentLevel!;
  // biome-ignore lint/style/noNonNullAssertion: necessary
  currentGemColor = gemColor?.length ? (gemColor as GemColorValues) : currentGemColor!;
  // biome-ignore lint/style/noNonNullAssertion: necessary
  currentGemQuantity = gemQuantity?.length ? gemQuantity : currentGemQuantity!;

  const card: Card = {
    id: uuidv4(),
    level: numberOrZero(currentLevel),
    gemColor: currentGemColor,
    price: [
      {
        color: 'black',
        quantity: numberOrZero(priceBlack || '0'),
      },
      {
        color: 'blue',
        quantity: numberOrZero(priceBlue || '0'),
      },
      {
        color: 'red',
        quantity: numberOrZero(priceRed || '0'),
      },
      {
        color: 'green',
        quantity: numberOrZero(priceGreen || '0'),
      },
      {
        color: 'white',
        quantity: numberOrZero(priceWhite || '0'),
      },
    ],
    gemQuantity: +currentGemQuantity,
  };

  cards.push(card);
}

const cardsById: Record<string, number> = {};
for (const card of cards) {
  if (!cardsById[card.id]) {
    cardsById[card.id] = 1;
  } else {
    cardsById[card.id] += 1;
  }
}

if (Object.values(cardsById).some((count) => count > 1)) {
  console.info('Duplicate cards found!');
  process.exitCode = 1;
  process.exit();
}

try {
  fs.writeFileSync(path.resolve('ref', 'cards.json'), JSON.stringify(cards, null, 2));
} catch (err) {
  console.error(err);
  process.exitCode = 1;
  process.exit();
}

console.info(`Successsfully generated ${cards.length} cards.`);
