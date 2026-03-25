import type { FC, JSX } from 'react';
import { useShallow } from 'zustand/shallow';

import { Card } from '#components/Card/Card';
import { Gem } from '#components/Gem/Gem';
import { type TokenColors, useGameStore } from '#stores/game.store';

import styles from './Reserved.module.css';

export const Reserved: FC = (): JSX.Element | null => {
  const { pickedCard, pickedTokens, returnToken, canAffordCard, setPickedCardIntent } = useGameStore(
    useShallow((state) => ({
      pickedCard: state.pickedCard,
      pickedTokens: state.pickedTokens,
      returnToken: state.returnToken,
      canAffordCard: state.canAffordCard,
      setPickedCardIntent: state.setPickedCardIntent,
    })),
  );

  if (!pickedCard && Object.values(pickedTokens).every((qty) => qty === 0)) {
    return null;
  }

  const showIntentToggle = pickedCard && canAffordCard(pickedCard.card);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {pickedCard && <Card card={pickedCard.card} width={100} />}
        {showIntentToggle && (
          <button
            type="button"
            className={styles.button}
            onClick={() =>
              setPickedCardIntent(
                pickedCard.intent === 'buy' ? 'reserve' : 'buy',
              )
            }
          >
            {pickedCard.intent === 'buy' ? 'Reserve instead' : 'Buy instead'}
          </button>
        )}
      </div>

      <div className={styles.tokens}>
        {Object.entries(pickedTokens).flatMap(([color, quantity]) => {
          return Array.from({ length: quantity }, (_, index) => (
            <button
              type="button"
              className={styles.button}
              // biome-ignore lint/suspicious/noArrayIndexKey: makes sense here
              key={`token-${color}-${index}`}
              onClick={() => {
                returnToken(color as TokenColors);
              }}
            >
              <Gem
                color={color as TokenColors}
                quantity={quantity}
                width={30}
                showQuantity={false}
              />
            </button>
          ));
        })}
      </div>
    </div>
  );
};
