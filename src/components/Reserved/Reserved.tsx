import type { FC } from 'react';
import { useShallow } from 'zustand/shallow';

import { type TokenColors, useGameStore } from '../../stores/game.store';
import { Card } from '../Card/Card';
import { Gem } from '../Gem/Gem';

import styles from './Reserved.module.scss';

export const Reserved: FC = (): JSX.Element => {
  const { canEndTurn, endTurn, pickedCard, pickedTokens, returnToken } =
    useGameStore(
      useShallow((state) => ({
        canEndTurn: state.canEndTurn,
        endTurn: state.endTurn,
        pickedCard: state.pickedCard,
        pickedTokens: state.pickedTokens,
        returnToken: state.returnToken,
      })),
    );

  if (!pickedCard && Object.values(pickedTokens).every((qty) => qty === 0)) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      <div className="card">
        {pickedCard && <Card card={pickedCard.card} width={100} />}
      </div>

      <div className="tokens">
        {Object.entries(pickedTokens).flatMap(([color, quantity]) => {
          return Array.from({ length: quantity }, (_, index) => (
            <button
              type="button"
              className={styles.button}
              // biome-ignore lint/suspicious/noArrayIndexKey: makes sense here
              key={`token-${color}-${index}`}
              onClick={() => {
                returnToken(color as TokenColors);
              }}
            >
              <Gem
                color={color as TokenColors}
                quantity={quantity}
                width={30}
                showQuantity={false}
              />
            </button>
          ));
        })}
      </div>

      <button
        type="button"
        onClick={endTurn}
        disabled={!canEndTurn()}
        className={styles.endTurnButton}
      >
        End Turn?
      </button>
    </div>
  );
};
