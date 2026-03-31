import type {
  BoardState,
  Card,
  GemColors,
  PlayerState,
} from '#stores/game.store';
import { useGameStore } from '#stores/game.store';

/**
 * Gem colours as a constant array — used throughout all AI players.
 */
export const GEM_COLORS: GemColors[] = [
  'red',
  'green',
  'blue',
  'white',
  'black',
];

/**
 * A tiny random nudge so ties never produce perfectly deterministic choices.
 */
export function randomSmall(): number {
  return Math.random() * 0.09 + 0.01;
}

/**
 * If `finishTurn` triggered a multi-noble choice, claim the first one.
 */
export function resolveNobles(): void {
  const store = useGameStore.getState();
  if (store.needsNobleCheck) {
    const nobles = store.getAffordableNobles();
    if (nobles.length > 0) {
      store.claimNoble(nobles[0]);
    }
  }
}

/**
 * A basic AI player that will always respect the rules and eventually win.
 *
 * Strategy:
 *   "If there are cards I can afford, I buy the best one (highest prestige).
 *    Otherwise, I collect the 3 most-needed tokens."
 *
 * Mirrors the Kotlin BasicPlayer at:
 * https://github.com/atwright147/splendor-api/blob/master/src/main/kotlin/com/github/achrafamil/splendor/api/players/BasicPlayer.kt
 */
export abstract class BasicPlayer {
  /**
   * Estimate how interested this player is in tokens of each gem colour,
   * based on the cost gap across all visible board cards.
   *
   * Interest = Σ (1 / gap) for each board card where gap > 0,
   * where gap = card cost − tokens held − gem-cards owned.
   *
   * Open so subclasses can augment the interest calculation (e.g. Johanna).
   */
  protected estimateInterestInColors(
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
   * Find the best affordable card on the board, ranked by prestige (highest
   * first). Subclasses can override this to apply additional scoring.
   */
  protected findBestAffordableBoardCard(
    _selfState: PlayerState,
    boardState: BoardState,
    canAffordCard: (card: Card) => boolean,
  ): Card | undefined {
    return [
      ...boardState.cards.level1,
      ...boardState.cards.level2,
      ...boardState.cards.level3,
    ]
      .slice()
      .sort((a, b) => b.prestige - a.prestige)
      .find((card) => canAffordCard(card));
  }

  /**
   * Find the best affordable card in the reserved pile, ranked by prestige.
   */
  protected findBestAffordableReservedCard(
    selfState: PlayerState,
    canAffordCard: (card: Card) => boolean,
  ): { card: Card; index: number } | undefined {
    return [...selfState.reservedCards]
      .map((card, index) => ({ card, index }))
      .sort((a, b) => b.card.prestige - a.card.prestige)
      .find(({ card }) => canAffordCard(card));
  }

  /**
   * If `endTurn` left `needToReturnTokens` set, return the least-interesting
   * tokens until the limit is satisfied. The store's `returnToken`
   * automatically calls `finishTurn` once the last excess token is returned.
   */
  private resolveReturnTokens(): void {
    const store = useGameStore.getState();
    if (!store.needToReturnTokens) return;

    const selfState = store.getCurrentPlayer();
    const interest = this.estimateInterestInColors(selfState, store.board);

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
   * Execute phase 1 of a turn (visible "pick" step) and return a commit
   * callback to call after a pause so the human player can see the action.
   *
   * Phase 1 — board card buy: picks the card (removes it from the board).
   * Phase 1 — token collect: picks each token (updates board counts).
   * Phase 1 — reserved card buy: no intermediate state; commit does everything.
   */
  playTurn(): () => void {
    const store = useGameStore.getState();
    const selfState = store.getCurrentPlayer();
    const boardState = store.board;

    // 1. Buy the best affordable board card.
    const boardCard = this.findBestAffordableBoardCard(
      selfState,
      boardState,
      store.canAffordCard,
    );
    if (boardCard) {
      store.pickCard(boardCard);
      store.setPickedCardIntent('buy');
      return () => {
        store.endTurn();
        this.resolveReturnTokens();
        resolveNobles();
      };
    }

    // 2. Buy the best affordable reserved card.
    const reserved = this.findBestAffordableReservedCard(
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

    // 3. Collect up to 3 tokens, most-needed first.
    const interest = this.estimateInterestInColors(selfState, boardState);
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
      this.resolveReturnTokens();
      resolveNobles();
    };
  }
}
