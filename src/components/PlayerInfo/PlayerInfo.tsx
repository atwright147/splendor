import classNames from 'classnames';
import type { FC } from 'react';
import { useShallow } from 'zustand/shallow';

import { useGameStore } from '../../stores/game.store';
import type { Uuid } from '../../types/utils.types';

import styles from './PlayerInfo.module.scss';

interface Props {
  id: Uuid;
}

export const PlayerInfo: FC<Props> = ({ id }): JSX.Element => {
  const { getPlayerById, getCurrentPlayer } = useGameStore(
    useShallow((state) => ({
      getPlayerById: state.getPlayerById,
      getCurrentPlayer: state.getCurrentPlayer,
    })),
  );

  const { tokens, gems, prestige } = getPlayerById(id);

  let isCurrentPlayer = false;
  if (getCurrentPlayer().uuid === id) {
    isCurrentPlayer = true;
  }

  return (
    <div
      className={classNames(styles.container, {
        [styles.current]: isCurrentPlayer,
      })}
    >
      <div className={classNames(styles.item, styles.red)}>
        <div className={styles.card}>{gems.red}</div>
        <div className={styles.gem}>{tokens.red}</div>
      </div>
      <div className={classNames(styles.item, styles.green)}>
        <div className={styles.card}>{gems.green}</div>
        <div className={styles.gem}>{tokens.green}</div>
      </div>
      <div className={classNames(styles.item, styles.blue)}>
        <div className={styles.card}>{gems.blue}</div>
        <div className={styles.gem}>{tokens.blue}</div>
      </div>
      <div className={classNames(styles.item, styles.black)}>
        <div className={styles.card}>{gems.black}</div>
        <div className={styles.gem}>{tokens.black}</div>
      </div>
      <div className={classNames(styles.item, styles.white)}>
        <div className={styles.card}>{gems.white}</div>
        <div className={styles.gem}>{tokens.white}</div>
      </div>
      <div className={classNames(styles.item, styles.gold)}>
        {/* <div className={styles.card}>{gems.gold}</div>
        <div className={styles.gem}>{tokens.gold}</div> */}
        Gold
      </div>
      <div className={classNames(styles.item, styles.prestige)}>
        <div>Prestige: {prestige}</div>
      </div>
    </div>
  );
};
