import { Dialog } from 'radix-ui';
import type { FC, JSX } from 'react';
import { useShallow } from 'zustand/shallow';

import { Gem } from '#components/Gem/Gem';
import { type TokenColors, useGameStore } from '#stores/game.store';
import { mergeTokens } from '#utils/mergeTokens';

import styles from './ReturnTokensDialog.module.css';

export const ReturnTokensDialog: FC = (): JSX.Element => {
  const {
    needToReturnTokens,
    tokensToReturn,
    pickedTokens,
    currentPlayer,
    returnToken,
  } = useGameStore(
    useShallow((state) => ({
      needToReturnTokens: state.needToReturnTokens,
      tokensToReturn: state.tokensToReturn,
      pickedTokens: state.pickedTokens,
      currentPlayer: state.getCurrentPlayer(),
      returnToken: state.returnToken,
    })),
  );

  const handleTokenReturn = (color: TokenColors) => {
    returnToken(color);
  };

  return (
    <Dialog.Root open={needToReturnTokens}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.dialog}>
          <Dialog.Title className={styles.title}>Return Tokens</Dialog.Title>
          <Dialog.Description className={styles.description}>
            You have more than 10 tokens. Please return {tokensToReturn} token
            {tokensToReturn > 1 ? 's' : ''}.
          </Dialog.Description>

          {/* <pre>{JSON.stringify(pickedTokens, null, 2)}</pre>

          <pre>
            {JSON.stringify(
              mergeGems(currentPlayer?.tokens, pickedTokens),
              null,
              2,
            )}
          </pre>
          */}
          {currentPlayer?.tokens && pickedTokens && (
            <div className={styles.tokenGrid}>
              {(
                Object.entries(
                  mergeTokens(currentPlayer.tokens, {
                    ...pickedTokens,
                    gold: 0,
                  }),
                ) as [TokenColors, number][]
              )
                .filter(([color, quantity]) => color !== 'gold' && quantity > 0)
                .map(([color, quantity]) => (
                  <button
                    type="button"
                    key={`return-token-${color}`}
                    className={styles.tokenButton}
                    onClick={() => handleTokenReturn(color)}
                  >
                    <Gem
                      color={color}
                      quantity={quantity}
                      width={40}
                      showQuantity={true}
                    />
                  </button>
                ))}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
