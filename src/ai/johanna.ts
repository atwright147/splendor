import type {
  BoardState,
  Card,
  GemColors,
  PlayerState,
} from '#stores/game.store';
import { BasicPlayer, GEM_COLORS, randomSmall } from './basicPlayer';

/**
 * Johanna extends BasicPlayer with one enhancement: card selection is also
 * influenced by the nobles currently on the board. She favours cards whose
 * gem colour brings her closer to claiming a noble.
 *
 * On average Johanna wins ~64% of games against BasicPlayer.
 *
 * Ported from the Kotlin implementation at:
 * https://github.com/atwright147/splendor-api/blob/master/src/main/kotlin/com/github/achrafamil/splendor/api/players/Johanna.kt
 */

const INTEREST_COEFFICIENT = 1;

class Johanna extends BasicPlayer {
  /**
   * For each gem colour, compute how much interest Johanna has in *cards* of
   * that colour based on the nobles currently on the board.
   *
   * Interest = Σ (1 / gap) for each noble where gap > 0,
   * where gap = noble cost for colour − cards already owned of that colour.
   */
  private computeNobleDrivenInterestInCardColors(
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
   * Override BasicPlayer's card selection to score cards by:
   *   prestige + nobleDrivenInterest[gem] * INTEREST_COEFFICIENT
   */
  protected override findBestAffordableBoardCard(
    selfState: PlayerState,
    boardState: BoardState,
    canAffordCard: (card: Card) => boolean,
  ): Card | undefined {
    const interestInCardColors = this.computeNobleDrivenInterestInCardColors(
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
          a.prestige +
          (interestInCardColors[a.gem] ?? 0) * INTEREST_COEFFICIENT;
        const scoreB =
          b.prestige +
          (interestInCardColors[b.gem] ?? 0) * INTEREST_COEFFICIENT;
        return scoreB - scoreA;
      })
      .find((card) => canAffordCard(card));
  }
}

/**
 * Execute Johanna's turn. Returns a commit callback to call after a pause so
 * the human player can see her selection before the turn advances.
 */
export function playJohannaTurn(): () => void {
  return new Johanna().playTurn();
}
