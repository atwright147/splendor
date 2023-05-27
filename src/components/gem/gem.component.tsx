import { FC } from 'react';
import classNames from 'classnames';
import { ColorKeys } from '../../types/colors.type';

import styles from './gem.component.module.scss';

interface Props {
  color: ColorKeys,
  quantity: number,
  width?: number,
}

export const Gem: FC<Props> = ({ color, quantity, width = 20 }): JSX.Element | null => {
  if (quantity === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={classNames(styles.gem, styles[color])} style={{ width: `${width}px` }}>
        <div className={styles.quantity}>{quantity}</div>
      </div>
    </div>
  )
}
