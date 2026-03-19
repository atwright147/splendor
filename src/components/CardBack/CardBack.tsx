import classNames from 'classnames';
import type { FC, JSX } from 'react';

import type { CardBackColors } from '#types/card-back.type';

import styles from './CardBack.module.css';

interface Props {
  color: CardBackColors;
  level: number;
  onClick?: () => void;
  disabled?: boolean;
}

export const CardBack: FC<Props> = ({
  color,
  level,
  onClick,
  disabled,
}): JSX.Element => {
  if (onClick) {
    return (
      <button
        type="button"
        className={classNames(
          styles.container,
          styles[color],
          styles.clickable,
          {
            [styles.disabled]: disabled,
          },
        )}
        onClick={onClick}
        disabled={disabled}
      >
        <div className={styles.content}>{level}</div>
      </button>
    );
  }

  return (
    <div className={classNames(styles.container, styles[color])}>
      <div className={styles.content}>{level}</div>
    </div>
  );
};
