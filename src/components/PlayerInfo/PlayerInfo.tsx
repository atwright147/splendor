import classNames from 'classnames';
import type { FC } from 'react';
import { useShallow } from 'zustand/shallow';

import { useGameStore } from '../../stores/game.store';
import type { Uuid } from '../../types/utils.types';

import { Card } from '../Card/Card';
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

  const player = getPlayerById(id);
  if (!player) {
    return <div className={styles.container}>Player not found</div>;
  }

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
        <div className={styles.card}>{player.gems.red}</div>
        <div className={styles.gem}>{player.tokens.red}</div>
      </div>
      <div className={classNames(styles.item, styles.green)}>
        <div className={styles.card}>{player.gems.green}</div>
        <div className={styles.gem}>{player.tokens.green}</div>
      </div>
      <div className={classNames(styles.item, styles.blue)}>
        <div className={styles.card}>{player.gems.blue}</div>
        <div className={styles.gem}>{player.tokens.blue}</div>
      </div>
      <div className={classNames(styles.item, styles.black)}>
        <div className={styles.card}>{player.gems.black}</div>
        <div className={styles.gem}>{player.tokens.black}</div>
      </div>
      <div className={classNames(styles.item, styles.white)}>
        <div className={styles.card}>{player.gems.white}</div>
        <div className={styles.gem}>{player.tokens.white}</div>
      </div>
      <div className={classNames(styles.item, styles.gold)}>
        <div className={styles.gem}>{player.tokens.gold}</div>
      </div>
      <div className={classNames(styles.item, styles.prestige)}>
        <div>Prestige: {player.prestige}</div>
      </div>
      <div className={styles['item reservedCards']}>
        {player.reservedCards.map((card) => (
          <Card key={card.id} card={card} width={100} />
        ))}
      </div>
    </div>
  );
};
