import classNames from 'classnames';
import type { FC } from 'react';
import type { RequireExactlyOne } from 'type-fest';

import type { TokenColor } from '../../stores/game.store';

import styles from './Gem.module.scss';

interface Props {
  color: TokenColor;
  quantity?: number;
  width?: number;
  showQuantity?: boolean;
}

export const Gem: FC<Props> = ({
  color,
  quantity,
  width = 20,
  showQuantity = true,
}): JSX.Element | null => {
  if (quantity === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div
        // biome-ignore lint/suspicious/noExplicitAny: fix later :/
        className={classNames(styles.gem, styles[color as any])}
        style={{ width: `${width}px` }}
      >
        <div className={styles.quantity}>{showQuantity && quantity}</div>
      </div>
    </div>
  );
};
