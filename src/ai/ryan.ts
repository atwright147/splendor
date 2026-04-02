import type { BoardState, GemColors, PlayerState } from '~stores/game.store';
import { BasicPlayer, GEM_COLORS } from './basicPlayer';

/**
 * Ryan is a basic player, but with less intelligence: Ryan will make random
 * choices when valuing token colours.
 *
 * Ported from the Kotlin implementation at:
 * https://github.com/atwright147/splendor-api/blob/master/src/main/kotlin/com/github/achrafamil/splendor/api/players/Ryan.kt
 */
class Ryan extends BasicPlayer {
  /**
   * Override colour-interest estimation with purely random values.
   */
  protected override estimateInterestInColors(
    _selfState: PlayerState,
    _boardState: BoardState,
  ): Record<GemColors, number> {
    return Object.fromEntries(
      GEM_COLORS.map((color) => [color, Math.random()]),
    ) as Record<GemColors, number>;
  }
}

/**
 * Execute Ryan's turn. Returns a commit callback to call after a pause so
 * the human player can see his selection before the turn advances.
 */
export function playRyanTurn(): () => void {
  return new Ryan().playTurn();
}
