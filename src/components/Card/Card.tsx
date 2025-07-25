import classnames from 'classnames';
import type { ComponentPropsWithoutRef, FC } from 'react';
import { useShallow } from 'zustand/shallow';

import {
  type Card as CardType,
  type GemColors,
  useGameStore,
} from '../../stores/game.store';
import { Gem } from '../Gem/Gem';

import styles from './Card.module.scss';

// https://stackoverflow.com/a/66810748/633056
type Props = {
  card: CardType;
  width?: number;
} & ComponentPropsWithoutRef<'button'>;

export const Card: FC<Props> = (props): JSX.Element => {
  if (!props || !props.card) {
    return <></>;
  }

  const { card, width = 200, className, ...restProps } = props;

  const { canAffordCard } = useGameStore(
    useShallow((state) => ({
      canAffordCard: state.canAffordCard,
    })),
  );

  return (
    <button
      style={{ width: `${width}px` }}
      className={classnames(
        styles.container,
        { [styles.affordable]: canAffordCard(card) },
        className,
      )}
      {...restProps}
      data-level={card.level}
      data-id={card.id}
      disabled={!restProps.onClick || !canAffordCard(card)}
    >
      <div className={styles.top}>
        <Gem color={card.gem} showQuantity={false} width={width / 4} />
        <span className={styles.prestige}>{card.prestige}</span>
      </div>

      <div className={styles.bottom}>
        {Object.entries(card.cost).map(([color, quantity]) => (
          <Gem
            key={color}
            color={color as GemColors}
            quantity={quantity}
            width={width / 5}
          />
        ))}
      </div>
    </button>
  );
};
