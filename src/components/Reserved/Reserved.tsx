import classNames from 'classnames';
import type { FC } from 'react';

import { useShallow } from 'zustand/shallow';
import { useGameStore } from '../../stores/game.store';
import { Card } from '../Card/Card';
import { Gem } from '../Gem/Gem';
import styles from './Reserved.module.scss';

export const Reserved: FC = (): JSX.Element => {
  const { reservedCard, reservedTokens } = useGameStore(
    useShallow((state) => ({
      reservedCard: state.reservedCard,
      reservedTokens: state.reservedTokens,
    })),
  );

  return (
    <div className={styles.container}>
      <div className="card">
        {reservedCard && <Card {...reservedCard} width={100} />}
      </div>

      <div className="tokens">
        {Object.entries(reservedTokens).map(([color, quantity]) => (
          <Gem
            key={color}
            color={color}
            quantity={quantity}
            width={30}
            showQuantity={false}
          />
        ))}
      </div>
    </div>
  );
};
