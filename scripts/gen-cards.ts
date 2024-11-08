import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

import { Card, TokenColor } from '../src/stores/game.store';

const numberOrZero = (num: string): number => {
  return +num || 0;
};

const cardsCsv = fs.readFileSync(path.resolve('ref', 'cards.csv'));
const cardLines = cardsCsv.toString().split('\n').slice(2);
const cards: Card[] = [];
let currentLevel: string;
let currentGemColor: TokenColor;
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
  currentGemColor = gemColor?.length
    ? (gemColor as TokenColor)
    : // biome-ignore lint/style/noNonNullAssertion: necessary
      currentGemColor!;
  // biome-ignore lint/style/noNonNullAssertion: necessary
  currentGemQuantity = gemQuantity?.length ? gemQuantity : currentGemQuantity!;

  const card: Card = {
    id: uuidv4(),
    level: numberOrZero(currentLevel),
    token: currentGemColor,
    cost: {
      black: numberOrZero(priceBlack || '0'),
      blue: numberOrZero(priceBlue || '0'),
      red: numberOrZero(priceRed || '0'),
      green: numberOrZero(priceGreen || '0'),
      white: numberOrZero(priceWhite || '0'),
    },
    prestige: +currentGemQuantity,
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
  fs.writeFileSync(
    path.resolve('ref', 'cards.json'),
    JSON.stringify(cards, null, 2),
  );
} catch (err) {
  console.error(err);
  process.exitCode = 1;
  process.exit();
}

console.info(`Successsfully generated ${cards.length} cards.`);
