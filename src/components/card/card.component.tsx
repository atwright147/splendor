import { FC } from 'react';
import type { Card as CardProps } from '../../types/cards.type';

import styles from './card.component.module.scss';
import { Gem } from '../gem/gem.component';

export const Card: FC<CardProps> = (props): JSX.Element => {

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Gem color={props.gemColor} quantity={props.gemQuantity} width={50} />
      </div>

      <div className={styles.bottom}>
        {props.price.map((gem) => (
            <Gem color={gem.color} quantity={gem.quantity} width={30} />
        ))}
      </div>
    </div>
  )
}
