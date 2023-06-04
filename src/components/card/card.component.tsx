import { ComponentPropsWithoutRef, FC } from 'react';
import classnames from 'classnames';
import type { Card as CardType } from '../../types/cards.type';
import { Gem } from '../gem/gem.component';

import styles from './card.component.module.scss';

// https://stackoverflow.com/a/66810748/633056
type Props = Omit<CardType, 'id'> & ComponentPropsWithoutRef<'div'>;

export const Card: FC<Props> = ({
  level,
  gemColor,
  price,
  gemQuantity,
  className,
  ...props
}): JSX.Element => {

  return (
    <div className={classnames(styles.container, className)} {...props} data-level={level}>
      <div className={styles.top}>
        <Gem color={gemColor} quantity={gemQuantity} width={50} />
      </div>

      <div className={styles.bottom}>
        {price.map((gem, index) => (
          <Gem key={index} color={gem.color} quantity={gem.quantity} width={30} />
        ))}
      </div>
    </div>
  )
}
