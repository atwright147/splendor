import classnames from 'classnames';
import type { ComponentPropsWithoutRef, FC } from 'react';
import { useShallow } from 'zustand/shallow';

import {
  type Card as CardType,
  type TokenColor,
  useGameStore,
} from '../../stores/game.store';
import { Gem } from '../Gem/Gem';

import styles from './Card.module.scss';

// https://stackoverflow.com/a/66810748/633056
type Props = Omit<CardType, 'id'> & {
  card: CardType;
  width?: number;
} & ComponentPropsWithoutRef<'div'>;

export const Card: FC<Props> = ({
  card,
  level,
  cost,
  token,
  prestige,
  width = 200,
  className,
  ...props
}): JSX.Element => {
  const { canAffordCard } = useGameStore(
    useShallow((state) => ({
      canAffordCard: state.canAffordCard,
    })),
  );

  return (
    <div
      style={{ width: `${width}px` }}
      className={classnames(
        styles.container,
        { [styles.affordable]: canAffordCard(card) },
        className,
      )}
      {...props}
      data-level={card.level}
    >
      <div className={styles.top}>
        <Gem color={card.token} showQuantity={false} width={width / 4} />
        <span className={styles.prestige}>{card.prestige}</span>
      </div>

      <div className={styles.bottom}>
        {Object.entries(card.cost).map(([color, quantity]) => (
          <Gem
            key={color}
            color={color as TokenColor}
            quantity={quantity}
            width={width / 5}
          />
        ))}
      </div>
    </div>
  );
};
