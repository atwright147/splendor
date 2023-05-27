import { FC } from 'react';
import classNames from 'classnames';
import { ColorKeys } from '../../types/colors.type';

import styles from './token.component.module.scss';

interface Props {
  color: ColorKeys,
  label: string | number,
  size?: number,
}

export const Token: FC<Props> = ({ color, label, size = 50 }): JSX.Element => (
  <div className={styles.container}>
    <div className={classNames(styles.token, styles[color])} style={{ width: `${size}px`}}>
      <div className={styles.label}>{label}</div>
    </div>
  </div>
)
