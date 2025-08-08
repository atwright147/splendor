import classNames from 'classnames';
import { Dialog } from 'radix-ui';
import { type JSX, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { Noble } from '#components/Noble/Noble';
import { type Noble as NobleType, useGameStore } from '#stores/game.store';
import styles from './NobleSelectDialog.module.css';

interface Props extends Dialog.DialogProps {}

export const NobleSelectDialog = ({
  defaultOpen,
  modal,
  onOpenChange,
  open = false,
}: Props): JSX.Element => {
  const { getAffordableNobles, claimNoble, endTurn } = useGameStore(
    useShallow((state) => ({
      getAffordableNobles: state.getAffordableNobles,
      claimNoble: state.claimNoble,
      endTurn: state.endTurn,
    })),
  );

  const [selectedNoble, setSelectedNoble] = useState<NobleType | null>(null);

  const isSelectedNoble = (noble: NobleType) => {
    return selectedNoble?.id === noble.id;
  };

  const preventClose = (event: Event): void => {
    event.preventDefault();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      modal={modal}
      defaultOpen={defaultOpen}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.DialogOverlay} />
        <Dialog.Content
          className={styles.DialogContent}
          onEscapeKeyDown={preventClose}
          onPointerDownOutside={preventClose}
          onInteractOutside={preventClose}
        >
          <Dialog.Title className={styles.DialogTitle}>
            Pick a Noble
          </Dialog.Title>

          <Dialog.Description className={styles.DialogDescription}>
            Choose a noble to claim.
          </Dialog.Description>

          <div className={styles.noblesList}>
            {getAffordableNobles().map((noble) => (
              <Noble
                key={noble.id}
                className={classNames({
                  [styles.selected]: isSelectedNoble(noble),
                })}
                noble={noble}
                onClick={() => setSelectedNoble(noble)}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 25,
              justifyContent: 'flex-end',
            }}
          >
            <Dialog.Close asChild>
              <button
                type="button"
                className={classNames(styles.Button, styles.green)}
                disabled={!selectedNoble}
                onClick={() => {
                  if (selectedNoble) {
                    claimNoble(selectedNoble);
                    endTurn();
                  }
                }}
              >
                Save changes
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
