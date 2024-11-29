import classnames from 'classnames';
import type { ComponentPropsWithoutRef, FC } from 'react';
import type { Card as CardType } from '../../stores/game.store';
import { Gem } from '../gem/gem.component';

import styles from './card.component.module.scss';

// https://stackoverflow.com/a/66810748/633056
type Props = Omit<CardType, 'id'> & ComponentPropsWithoutRef<'div'>;

export const Card: FC<Props> = ({
  level,
  cost,
  token,
  prestige,
  className,
  ...props
}): JSX.Element => {
  return (
    <div
      className={classnames(styles.container, className)}
      {...props}
      data-level={level}
    >
      <div className={styles.top}>
        <Gem color={token} quantity={1} width={50} />
      </div>

      <div className={styles.bottom}>
        {Object.entries(cost).map(([color, quantity]) => (
          <Gem key={color} color={color} quantity={quantity} width={30} />
        ))}
      </div>
    </div>
  );
};
