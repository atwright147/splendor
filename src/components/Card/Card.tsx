import classnames from 'classnames';
import type { ComponentPropsWithoutRef, FC } from 'react';
import type { Card as CardType } from '../../stores/game.store';
import { Gem } from '../Gem/Gem';

import styles from './Card.module.scss';

// https://stackoverflow.com/a/66810748/633056
type Props = Omit<CardType, 'id'> & {
  width?: number;
} & ComponentPropsWithoutRef<'div'>;

export const Card: FC<Props> = ({
  level,
  cost,
  token,
  prestige,
  width = 200,
  className,
  ...props
}): JSX.Element => {
  return (
    <div
      style={{ width: `${width}px` }}
      className={classnames(styles.container, className)}
      {...props}
      data-level={level}
    >
      <div className={styles.top}>
        <Gem color={token} quantity={1} width={width / 4} />
      </div>

      <div className={styles.bottom}>
        {Object.entries(cost).map(([color, quantity]) => (
          <Gem
            key={color}
            color={color}
            quantity={quantity}
            width={width / 5}
          />
        ))}
      </div>
    </div>
  );
};
