import classnames from 'classnames';
import pluralize from 'pluralize';
import type { ComponentPropsWithoutRef, FC, JSX } from 'react';
import { useShallow } from 'zustand/shallow';

import {
  type Card as CardType,
  type GemColors,
  useGameStore,
} from '../../stores/game.store';
import { Gem } from '../Gem/Gem';
import { UnstyledButton } from '../UnstyledButton/UnstyledButton';

import styles from './Card.module.css';

const makeCostString = (cost: Record<GemColors, number>): string => {
  return Object.entries(cost)
    .map(([color, quantity]) => `${quantity} ${pluralize(color, quantity)}`)
    .join(', ');
};

// https://stackoverflow.com/a/66810748/633056
type Props = {
  card: CardType;
  width?: number;
} & ComponentPropsWithoutRef<'button'>;

export const Card: FC<Props> = (props): JSX.Element | null => {
  const { canAffordCard } = useGameStore(
    useShallow((state) => ({
      canAffordCard: state.canAffordCard,
    })),
  );

  if (!props || !props.card) {
    return null;
  }

  const { card, width = 200, className, ...restProps } = props;

  const title = `Level ${card.level} card, costs: ${makeCostString(card.cost)}, offering prestige: ${card.prestige} and a ${card.gem} gem.`;

  return (
    <UnstyledButton
      style={{ width: `${width}px` }}
      className={classnames(className, styles.card, {
        [styles.affordable]: canAffordCard(card),
      })}
      {...restProps}
      data-level={card.level}
      data-card-id={card.id}
      title={title}
    >
      <div className={styles.content}>
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
      </div>
    </UnstyledButton>
  );
};
