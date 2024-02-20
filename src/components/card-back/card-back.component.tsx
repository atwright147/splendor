import { FC } from 'react';
import classNames from 'classnames';
import { CardBackColors } from '../../types/card-back.type';

import styles from './card-back.component.module.scss';

interface Props {
  color: CardBackColors;
  level: number;
}

export const CardBack: FC<Props> = ({ color, level }): JSX.Element => {
  return <div className={classNames(styles.container, styles[color])}>{level}</div>;
};
