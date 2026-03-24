import type { FC, JSX } from 'react';

import { useGameStore } from '#stores/game.store';

import styles from './FinalRoundBanner.module.css';

export const FinalRoundBanner: FC = (): JSX.Element | null => {
  const finalRoundPlayer = useGameStore((state) => state.finalRoundPlayer);
  const finalRoundTriggered = useGameStore(
    (state) => state.finalRoundTriggered,
  );
  const isGameOver = useGameStore((state) => state.isGameOver);

  if (!finalRoundTriggered || isGameOver) {
    return null;
  }

  return (
    <div className={styles.banner}>
      Final round — Player {(finalRoundPlayer ?? 0) + 1} reached 15 points!
    </div>
  );
};
