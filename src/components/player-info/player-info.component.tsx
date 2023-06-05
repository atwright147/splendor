import { FC } from 'react';
import classNames from 'classnames';
import { TokenColorValues } from '../../types/colors.type';

import styles from './player-info.component.module.scss';

interface Props {
  ownedTokens?: {
    [color in TokenColorValues]: number
  },
  tempTokens?: {
    [color in TokenColorValues]: number
  },
}

const initialTokens: {[color in TokenColorValues]: number} = {
  'black': 0,
  'blue': 0,
  'green': 0,
  'red': 0,
  'white': 0,
  'gold': 0,
}

export const PlayerInfo: FC<Props> = ({
  ownedTokens = initialTokens,
  tempTokens = initialTokens
}): JSX.Element => (
  <div className={styles.container}>
    <div className={classNames(styles.item, styles.red)}>
      <div className={styles.card}>{ownedTokens.red}</div>
      <div className={styles.gem}>{tempTokens.red}</div>
    </div>
    <div className={classNames(styles.item, styles.green)}>
      <div className={styles.card}>{ownedTokens.green}</div>
      <div className={styles.gem}>{tempTokens.green}</div>
    </div>
    <div className={classNames(styles.item, styles.blue)}>
      <div className={styles.card}>{ownedTokens.blue}</div>
      <div className={styles.gem}>{tempTokens.blue}</div>
    </div>
    <div className={classNames(styles.item, styles.black)}>
      <div className={styles.card}>{ownedTokens.black}</div>
      <div className={styles.gem}>{tempTokens.black}</div>
    </div>
    <div className={classNames(styles.item, styles.white)}>
      <div className={styles.card}>{ownedTokens.white}</div>
      <div className={styles.gem}>{tempTokens.white}</div>
    </div>
    <div className={classNames(styles.item, styles.gold)}>
      <div className={styles.card}>{ownedTokens.gold}</div>
      <div className={styles.gem}>{tempTokens.gold}</div>
    </div>
  </div>
)
