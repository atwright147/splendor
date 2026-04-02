import type {
  BoardState,
  Card,
  GemColors,
  PlayerState,
} from '~stores/game.store';
import { BasicPlayer, GEM_COLORS } from './basicPlayer';

/**
 * Eve is a basic player but with a bit of rivalry: Eve will try to secure
 * cards of colours that appear frequently in nobles on the board, preventing
 * opponents from easily completing them.
 *
 * Ported from the Kotlin implementation at:
 * https://github.com/atwright147/splendor-api/blob/master/src/main/kotlin/com/github/achrafamil/splendor/api/players/Eve.kt
 */
class Eve extends BasicPlayer {
  /**
   * Compute interest in card colours based on how often each colour appears
   * in the nobles currently on the board. High frequency = higher value to block.
   */
  private computeNobleBlockingInterest(
    boardState: BoardState,
  ): Record<GemColors, number> {
    const interest = Object.fromEntries(
      GEM_COLORS.map((c) => [c, 0]),
    ) as Record<GemColors, number>;

    boardState.nobles.forEach((noble) => {
      (Object.entries(noble.cost) as [GemColors, number][]).forEach(
        ([color]) => {
          interest[color] += 1.0;
        },
      );
    });

    return interest;
  }

  /**
   * Override card selection to prioritize cards of colours that appear in
   * many nobles, making it harder for opponents to complete them.
   */
  protected override findBestAffordableBoardCard(
    _selfState: PlayerState,
    boardState: BoardState,
    canAffordCard: (card: Card) => boolean,
  ): Card | undefined {
    const blockingInterest = this.computeNobleBlockingInterest(boardState);

    return [
      ...boardState.cards.level1,
      ...boardState.cards.level2,
      ...boardState.cards.level3,
    ]
      .slice()
      .sort((a, b) => {
        const scoreA = a.prestige + (blockingInterest[a.gem] ?? 0) * 0.5;
        const scoreB = b.prestige + (blockingInterest[b.gem] ?? 0) * 0.5;
        return scoreB - scoreA;
      })
      .find((card) => canAffordCard(card));
  }
}

/**
 * Execute Eve's turn. Returns a commit callback to call after a pause so
 * the human player can see her selection before the turn advances.
 */
export function playEveTurn(): () => void {
  return new Eve().playTurn();
}
