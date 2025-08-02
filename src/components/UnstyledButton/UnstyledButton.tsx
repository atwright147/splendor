import classnames from 'classnames';
import { forwardRef } from 'react';

import styles from './UnstyledButton.module.css';

interface Props extends React.ComponentPropsWithoutRef<'button'> {}

export const UnstyledButton = forwardRef<HTMLButtonElement, Props>(
  ({ children, className, ...props }, forwardedRef) => {
    const ref = forwardedRef || null;

    return (
      <button
        ref={ref}
        className={classnames(styles.container, className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
