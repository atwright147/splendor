import classnames from 'classnames';
import type { FC, JSX } from 'react';
import { useShallow } from 'zustand/shallow';

import { Gem } from '#components/Gem/Gem';
import { UnstyledButton } from '#components/UnstyledButton/UnstyledButton';
import { type Noble as NobleType, useGameStore } from '#stores/game.store';

import styles from './Noble.module.css';

interface Props {
  noble: NobleType;
}

export const Noble: FC<Props> = ({ noble }): JSX.Element => {
  const { canAffordNoble } = useGameStore(
    useShallow((state) => ({
      canAffordNoble: state.canAffordNoble,
    })),
  );

  const isAffordable = canAffordNoble(noble);

  return (
    <UnstyledButton
      className={classnames(styles.container, {
        [styles.affordable]: isAffordable,
      })}
      disabled={!isAffordable}
    >
      <div className={styles.top}>
        <p className={styles.prestige}>{noble.prestige}</p>
      </div>

      <div className={styles.bottom}>
        {Object.entries(noble.cost).map(([color, price]) => (
          // biome-ignore lint/suspicious/noExplicitAny: fix later :/
          <Gem key={color} color={color as any} quantity={price} width={30} />
        ))}
      </div>
    </UnstyledButton>
  );
};
