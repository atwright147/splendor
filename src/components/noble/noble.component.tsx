import { FC } from 'react';
import { Gem } from '../gem/gem.component';
import type { Noble as NobleType } from '../../types/noble.type';

import styles from './noble.component.module.scss';

type Props = Omit<NobleType, 'id'>;

export const Noble: FC<Props> = (props): JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <p className={styles.prestige}>{props.prestige}</p>
      </div>

      <div className={styles.bottom}>
        {props.price.map((price, index) => (
          <Gem key={index} color={price.color} quantity={price.quantity} width={30} />
        ))}
      </div>
    </div>
  );
};
