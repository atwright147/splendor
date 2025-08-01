import classNames from 'classnames';
import type { FC, JSX } from 'react';

import type { CardBackColors } from '../../types/card-back.type';

import styles from './CardBack.module.css';

interface Props {
  color: CardBackColors;
  level: number;
}

export const CardBack: FC<Props> = ({ color, level }): JSX.Element => {
  return (
    <div className={classNames(styles.container, styles[color])}>
      <div className={styles.content}>{level}</div>
    </div>
  );
};
