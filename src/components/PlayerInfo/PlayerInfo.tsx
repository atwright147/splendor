import classNames from 'classnames';
import type { FC } from 'react';

import type { Card, Tokens } from '../../stores/game.store';
import styles from './PlayerInfo.module.scss';

interface Props {
  cards: Card[];
  tokens: Tokens;
}

export const PlayerInfo: FC<Props> = ({ cards, tokens }): JSX.Element => {
  console.info(cards);
  return (
    <div className={styles.container}>
      <div className={classNames(styles.item, styles.red)}>
        <div className={styles.card}>{tokens.red}</div>
        <div className={styles.gem}>{1}</div>
      </div>

      <div className={classNames(styles.item, styles.green)}>
        <div className={styles.card}>{tokens.green}</div>
        <div className={styles.gem}>{2}</div>
      </div>

      <div className={classNames(styles.item, styles.blue)}>
        <div className={styles.card}>{tokens.blue}</div>
        <div className={styles.gem}>{3}</div>
      </div>

      <div className={classNames(styles.item, styles.black)}>
        <div className={styles.card}>{tokens.black}</div>
        <div className={styles.gem}>{4}</div>
      </div>

      <div className={classNames(styles.item, styles.white)}>
        <div className={styles.card}>{tokens.white}</div>
        <div className={styles.gem}>{5}</div>
      </div>

      <div className={classNames(styles.item, styles.gold)}>
        <div className={styles.card}>{tokens.gold}</div>
      </div>
    </div>
  );
};
