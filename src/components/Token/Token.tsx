import classnames from 'classnames';
import type { ComponentPropsWithoutRef, FC } from 'react';

import type { TokenColorValues } from '../../types/colors.type';

import styles from './Token.module.scss';

interface Props extends ComponentPropsWithoutRef<'div'> {
  color: TokenColorValues;
  label?: string | number;
  quantity?: number;
  size?: number;
}

export const Token: FC<Props> = ({
  color,
  label,
  quantity,
  size = 50,
  className,
  ...props
}): JSX.Element => (
  <div
    className={classnames(styles.container, className)}
    {...props}
    data-level={color}
  >
    <div
      className={classnames(styles.token, styles[color], {
        [styles.empty]: !quantity,
      })}
      style={{ width: `${size}px` }}
    >
      <div className={styles.label}>{quantity ?? label}</div>
    </div>
  </div>
);
