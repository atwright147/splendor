import classNames from 'classnames';
import type { FC } from 'react';
import { useShallow } from 'zustand/shallow';

import { type TokenColor, useGameStore } from '../../stores/game.store';
import { Card } from '../Card/Card';
import { Gem } from '../Gem/Gem';

import styles from './Reserved.module.scss';

export const Reserved: FC = (): JSX.Element => {
  const { pickedCard, pickedTokens } = useGameStore(
    useShallow((state) => ({
      pickedCard: state.pickedCard,
      pickedTokens: state.pickedTokens,
    })),
  );

  if (!pickedCard && Object.values(pickedTokens).every((qty) => qty === 0)) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      <div className="card">
        {pickedCard && <Card {...pickedCard} width={100} />}
      </div>

      <div className="tokens">
        {Object.entries(pickedTokens).map(([color, quantity]) => (
          <Gem
            key={color}
            color={color as TokenColor}
            quantity={quantity as any}
            width={30}
            showQuantity={false}
          />
        ))}
      </div>
    </div>
  );
};
