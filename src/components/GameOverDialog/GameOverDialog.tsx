import { Dialog } from 'radix-ui';
import type { FC, JSX } from 'react';

import type { PlayerState } from '#stores/game.store';

import styles from './GameOverDialog.module.css';

interface Props {
  open: boolean;
  players: PlayerState[];
  winner: PlayerState | null;
  onPlayAgain: () => void;
}

export const GameOverDialog: FC<Props> = ({
  open,
  players,
  winner,
  onPlayAgain,
}): JSX.Element => {
  const winnerIndex = winner
    ? players.findIndex((p) => p.uuid === winner.uuid)
    : -1;

  const preventClose = (event: Event): void => {
    event.preventDefault();
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.content}
          onEscapeKeyDown={preventClose}
          onPointerDownOutside={preventClose}
          onInteractOutside={preventClose}
        >
          <Dialog.Title className={styles.title}>Game Over</Dialog.Title>

          <Dialog.Description className={styles.result}>
            {winner
              ? `Player ${winnerIndex + 1} wins with ${winner.prestige} prestige points and ${winner.cards.length} cards!`
              : "It's a tie!"}
          </Dialog.Description>

          <ul className={styles.scores}>
            {players.map((player, index) => (
              <li
                key={player.uuid}
                className={`${styles.score} ${
                  winner?.uuid === player.uuid ? styles.scoreWinner : ''
                }`}
              >
                Player {index + 1}: {player.prestige} pts &middot;{' '}
                {player.cards.length} cards
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={styles.playAgainButton}
            onClick={onPlayAgain}
          >
            Play Again
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
