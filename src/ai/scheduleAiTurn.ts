import { eveTurnTiming, playEveTurn } from './eve';
import { joeTurnTiming, playJoeTurn } from './joe';
import { johannaTurnTiming, playJohannaTurn } from './johanna';
import { playRyanTurn, ryanTurnTiming } from './ryan';

type AiTurnFn = () => () => void;

type ScheduleAiTurnOptions = {
  pickDelayMs?: number;
  commitDelayMs?: number;
};

type AiTurnConfig = {
  playTurn: AiTurnFn;
  timing: {
    pickDelayMs: number;
    commitDelayMs: number;
  };
};

const aiTurnMap: Record<string, AiTurnConfig> = {
  eve: {
    playTurn: playEveTurn,
    timing: eveTurnTiming,
  },
  joe: {
    playTurn: playJoeTurn,
    timing: joeTurnTiming,
  },
  ryan: {
    playTurn: playRyanTurn,
    timing: ryanTurnTiming,
  },
  johanna: {
    playTurn: playJohannaTurn,
    timing: johannaTurnTiming,
  },
};

/**
 * Schedule a two-phase AI turn: first pick, then commit after a short delay.
 * Returns a cleanup function that cancels pending timers.
 */
export function scheduleAiTurn(
  aiType: string | undefined,
  options: ScheduleAiTurnOptions = {},
): () => void {
  const selectedAi = aiTurnMap[aiType ?? 'johanna'] ?? aiTurnMap.johanna;
  const pickDelayMs = options.pickDelayMs ?? selectedAi.timing.pickDelayMs;
  const commitDelayMs =
    options.commitDelayMs ?? selectedAi.timing.commitDelayMs;

  let commitTimer: ReturnType<typeof setTimeout> | undefined;
  const playAiTurn = selectedAi.playTurn;

  const pickTimer = setTimeout(() => {
    const commit = playAiTurn();
    commitTimer = setTimeout(commit, commitDelayMs);
  }, pickDelayMs);

  return () => {
    clearTimeout(pickTimer);
    if (commitTimer !== undefined) {
      clearTimeout(commitTimer);
    }
  };
}
