import type {
  BoardState,
  Card,
  GemColors,
  PlayerState,
} from '#stores/game.store';
import { useGameStore } from '#stores/game.store';

/**
 * Johanna is an AI player with a noble-driven card selection strategy.
 *
 * Strategy:
 *   1. If there is an affordable card, buy the best one — scored by prestige
 *      plus an interest coefficient derived from how close each noble's cost
 *      can be satisfied by owning cards of that gem colour.
 *   2. If nothing can be bought, collect up to 3 tokens from the colours most
 *      needed to close the cost-gap on board cards.
 *
 * Ported from the Kotlin implementation at:
 * https://github.com/atwright147/splendor-api/blob/master/src/main/kotlin/com/github/achrafamil/splendor/api/players/Johanna.kt
 */

const INTEREST_COEFFICIENT = 1;
const GEM_COLORS: GemColors[] = ['red', 'green', 'blue', 'white', 'black'];

// A tiny random nudge avoids ties producing deterministic (boring) choices.
function randomSmall(): number {
  return Math.random() * 0.09 + 0.01;
}

/**
 * For each gem colour, compute how much interest Johanna has in cards of that
 * colour based on the nobles currently on the board.
 *
 * Interest = Σ (1 / gap) for each noble where gap > 0,
 * where gap = noble cost for colour − cards already owned of that colour.
 */
function computeNobleDrivenInterestInCardColors(
  selfState: PlayerState,
  boardState: BoardState,
): Record<GemColors, number> {
  const interest = Object.fromEntries(
    GEM_COLORS.map((c) => [c, randomSmall()]),
  ) as Record<GemColors, number>;

  boardState.nobles.forEach((noble) => {
    (Object.entries(noble.cost) as [GemColors, number][]).forEach(
      ([color, cost]) => {
        const cardsOfColor = selfState.cards.filter(
          (c) => c.gem === color,
        ).length;
        const gap = Math.max(0, cost - cardsOfColor);
        if (gap > 0) {
          interest[color] += 1.0 / gap;
        }
      },
    );
  });

  return interest;
}

/**
 * Find the best affordable card on the board, ranked by:
 *   prestige + interestInCardColors[card.gem] * INTEREST_COEFFICIENT
 */
function findBestAffordableBoardCard(
  selfState: PlayerState,
  boardState: BoardState,
  canAffordCard: (card: Card) => boolean,
): Card | undefined {
  const interestInCardColors = computeNobleDrivenInterestInCardColors(
    selfState,
    boardState,
  );

  return [
    ...boardState.cards.level1,
    ...boardState.cards.level2,
    ...boardState.cards.level3,
  ]
    .slice()
    .sort((a, b) => {
      const scoreA =
        a.prestige + (interestInCardColors[a.gem] ?? 0) * INTEREST_COEFFICIENT;
      const scoreB =
        b.prestige + (interestInCardColors[b.gem] ?? 0) * INTEREST_COEFFICIENT;
      return scoreB - scoreA;
    })
    .find((card) => canAffordCard(card));
}

/**
 * Find the best affordable card from the player's reserved pile, ranked by
 * prestige (highest first).
 */
function findBestAffordableReservedCard(
  selfState: PlayerState,
  canAffordCard: (card: Card) => boolean,
): { card: Card; index: number } | undefined {
  return [...selfState.reservedCards]
    .map((card, index) => ({ card, index }))
    .sort((a, b) => b.card.prestige - a.card.prestige)
    .find(({ card }) => canAffordCard(card));
}

/**
 * For each gem colour, estimate how interested Johanna is in tokens of that
 * colour based on the cost gap across all visible board cards.
 *
 * Interest = Σ (1 / gap) for each board card where gap > 0,
 * where gap = card cost − tokens already held − gem-cards already owned.
 */
function estimateInterestInTokenColors(
  selfState: PlayerState,
  boardState: BoardState,
): Record<GemColors, number> {
  const interest = Object.fromEntries(
    GEM_COLORS.map((c) => [c, randomSmall()]),
  ) as Record<GemColors, number>;

  const allCards = [
    ...boardState.cards.level1,
    ...boardState.cards.level2,
    ...boardState.cards.level3,
  ];

  allCards.forEach((card) => {
    (Object.entries(card.cost) as [GemColors, number][]).forEach(
      ([color, cost]) => {
        const tokens = selfState.tokens[color] ?? 0;
        const gems = selfState.cards.filter((c) => c.gem === color).length;
        const gap = Math.max(0, cost - tokens - gems);
        if (gap > 0) {
          interest[color] += 1.0 / gap;
        }
      },
    );
  });

  return interest;
}

/**
 * If commitTokens/commitCard pushed Johanna over the 10-token limit, return
 * the least-interesting tokens until the limit is satisfied. The store's
 * returnToken implementation will call finishTurn() automatically once the
 * last excess token is returned.
 */
function resolveReturnTokens(): void {
  const store = useGameStore.getState();
  if (!store.needToReturnTokens) return;

  const selfState = store.getCurrentPlayer();
  const interest = estimateInterestInTokenColors(selfState, store.board);

  const colorsToReturn = GEM_COLORS.filter(
    (color) => selfState.tokens[color] > 0,
  ).sort((a, b) => interest[a] - interest[b]);

  let remaining = store.tokensToReturn;
  for (const color of colorsToReturn) {
    if (remaining <= 0) break;
    useGameStore.getState().returnToken(color);
    remaining--;
  }
}

/**
 * If finishTurn set needsNobleCheck (multiple newly-affordable nobles),
 * claim the first one on Johanna's behalf.
 */
function resolveNobles(): void {
  const store = useGameStore.getState();
  if (store.needsNobleCheck) {
    const nobles = store.getAffordableNobles();
    if (nobles.length > 0) {
      store.claimNoble(nobles[0]);
    }
  }
}

/**
 * Execute phase 1 of Johanna's turn — the visible "action" step.
 *
 * For a board-card buy: picks the card (removes it from the board, shows
 * the placeholder and the "Buy Card" button).
 * For a token collection: picks each token (updates board counts and the
 * picked-token display).
 * For a reserved-card buy: no visible intermediate state; the commit
 * callback handles everything.
 *
 * Returns a "commit" callback that must be called after a short delay so
 * the player can see Johanna's selection before the turn advances.
 *
 * Call this when `currentPlayerIndex` corresponds to Johanna's player slot.
 */
export function playJohannaTurn(): () => void {
  const store = useGameStore.getState();
  const selfState = store.getCurrentPlayer();
  const boardState = store.board;

  // 1. Try to buy the best card on the board.
  const boardCard = findBestAffordableBoardCard(
    selfState,
    boardState,
    store.canAffordCard,
  );
  if (boardCard) {
    store.pickCard(boardCard);
    store.setPickedCardIntent('buy');
    return () => {
      store.endTurn();
      resolveReturnTokens();
      resolveNobles();
    };
  }

  // 2. Try to buy from reserved cards.
  const reserved = findBestAffordableReservedCard(
    selfState,
    store.canAffordCard,
  );
  if (reserved) {
    return () => {
      store.commitCard(reserved.index);
      store.finishTurn();
      resolveNobles();
    };
  }

  // 3. Collect tokens — up to 3 different colours, most-needed first.
  //    Cap at the player's remaining headroom under the 10-token limit.
  const interest = estimateInterestInTokenColors(selfState, boardState);
  const currentTokenCount = Object.values(selfState.tokens).reduce(
    (sum, n) => sum + n,
    0,
  );
  const maxToTake = Math.max(0, 10 - currentTokenCount);

  const colorsToTake = GEM_COLORS.filter(
    (color) => boardState.tokens[color] > 0,
  )
    .sort((a, b) => interest[b] - interest[a])
    .slice(0, Math.min(3, maxToTake));

  colorsToTake.forEach((color) => store.pickToken(color));
  return () => {
    store.endTurn();
    resolveReturnTokens();
    resolveNobles();
  };
}
