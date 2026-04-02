import { BasicPlayer } from './basicPlayer';

/**
 * Joe is literally just a basic player.
 *
 * Ported from the Kotlin implementation at:
 * https://github.com/atwright147/splendor-api/blob/master/src/main/kotlin/com/github/achrafamil/splendor/api/players/Joe.kt
 */
class Joe extends BasicPlayer {}

/**
 * Execute Joe's turn. Returns a commit callback to call after a pause so
 * the human player can see his selection before the turn advances.
 */
export function playJoeTurn(): () => void {
  return new Joe().playTurn();
}
