import type { FC } from 'react';

import type { Noble as NobleType } from '../../stores/game.store';
import { Gem } from '../Gem/Gem';

import styles from './Noble.module.css';

type Props = Omit<NobleType, 'id'>;

export const Noble: FC<Props> = ({ cost, prestige }): JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <p className={styles.prestige}>{prestige}</p>
      </div>

      <div className={styles.bottom}>
        {Object.entries(cost).map(([color, price]) => (
          // biome-ignore lint/suspicious/noExplicitAny: fix later :/
          <Gem key={color} color={color as any} quantity={price} width={30} />
        ))}
      </div>
    </div>
  );
};
