import type { FC, JSX } from 'react';

import type { Noble as NobleType } from '../../stores/game.store';
import { Gem } from '../Gem/Gem';
import { UnstyledButton } from '../UnstyledButton/UnstyledButton';

import styles from './Noble.module.css';

type Props = Omit<NobleType, 'id'>;

export const Noble: FC<Props> = ({ cost, prestige }): JSX.Element => {
  const isDisabled = true; // TODO: Implement logic to determine if the Noble is affordable

  return (
    <UnstyledButton className={styles.container} disabled={isDisabled}>
      <div className={styles.top}>
        <p className={styles.prestige}>{prestige}</p>
      </div>

      <div className={styles.bottom}>
        {Object.entries(cost).map(([color, price]) => (
          // biome-ignore lint/suspicious/noExplicitAny: fix later :/
          <Gem key={color} color={color as any} quantity={price} width={30} />
        ))}
      </div>
    </UnstyledButton>
  );
};
