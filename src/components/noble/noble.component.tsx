import { FC } from 'react';
import type { Noble as NobleProps } from '../../types/noble.type';

import styles from './noble.component.module.scss';
import { Gem } from '../gem/gem.component';

export const Noble: FC<NobleProps> = (props): JSX.Element => {

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <p className={styles.prestige}>{props.prestige}</p>
      </div>

      <div className={styles.bottom}>
        {props.price.map((gem) => (
            <Gem color={gem.color} quantity={gem.quantity} width={30} />
        ))}
      </div>
    </div>
  )
}
