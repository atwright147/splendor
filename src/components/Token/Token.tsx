import classnames from 'classnames';
import type { ComponentPropsWithoutRef, FC, JSX } from 'react';

import type { TokenColorValues } from '../../types/colors.type';
import { UnstyledButton } from '../UnstyledButton/UnstyledButton';

import styles from './Token.module.css';

interface Props extends ComponentPropsWithoutRef<'button'> {
  color: TokenColorValues;
  label: string | number;
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
}): JSX.Element => {
  const isDisabled = !quantity || !props.onClick;

  return (
    <UnstyledButton
      className={classnames(styles.container, className)}
      {...props}
      data-color={color}
      disabled={isDisabled}
      type="button"
      aria-label={label ? `${label} token` : 'Token'}
      title={label ? `${label} token` : 'Token'}
    >
      <div
        className={classnames(styles.token, styles[color], {
          [styles.empty]: !quantity,
        })}
        style={{ width: `${size}px` }}
      >
        <div className={styles.label}>{quantity ?? label}</div>
      </div>
    </UnstyledButton>
  );
};
