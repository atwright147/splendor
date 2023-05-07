import { FC } from 'react';
import classNames from 'classnames';

import styles from './player-info.component.module.scss';

interface Props {
  ownedGems?: number,
  tempGems?: number,
}

export const PlayerInfo: FC<Props> = ({ ownedGems = 0, tempGems = 0 }): JSX.Element => (
  <div className={styles.container}>
    <div className={classNames(styles.item, styles.red)}>
      <div className={styles.card}>{ownedGems}</div>
      <div className={styles.gem}>{tempGems}</div>
    </div>
    <div className={classNames(styles.item, styles.green)}>
      <div className={styles.card}>{ownedGems}</div>
      <div className={styles.gem}>{tempGems}</div>
    </div>
    <div className={classNames(styles.item, styles.blue)}>
      <div className={styles.card}>{ownedGems}</div>
      <div className={styles.gem}>{tempGems}</div>
    </div>
    <div className={classNames(styles.item, styles.black)}>
      <div className={styles.card}>{ownedGems}</div>
      <div className={styles.gem}>{tempGems}</div>
    </div>
    <div className={classNames(styles.item, styles.white)}>
      <div className={styles.card}>{ownedGems}</div>
      <div className={styles.gem}>{tempGems}</div>
    </div>
    <div className={classNames(styles.item, styles.gold)}>
      <div className={styles.card}>{ownedGems}</div>
      <div className={styles.gem}>{tempGems}</div>
    </div>
  </div>
)
