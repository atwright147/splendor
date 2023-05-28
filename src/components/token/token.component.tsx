import { ComponentPropsWithoutRef, FC } from 'react';
import classnames from 'classnames';
import { TokenColorValues } from '../../types/colors.type';

import styles from './token.component.module.scss';

interface Props extends ComponentPropsWithoutRef<'div'> {
  color: TokenColorValues,
  label: string | number,
  size?: number,
}

export const Token: FC<Props> = ({ color, label, size = 50, className, ...props }): JSX.Element => (
  <div className={classnames(styles.container, className)} {...props} data-level={color}>
    <div className={classnames(styles.token, styles[color])} style={{ width: `${size}px`}}>
      <div className={styles.label}>{label}</div>
    </div>
  </div>
)
