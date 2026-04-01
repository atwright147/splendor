import { type FC, type JSX, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { Card } from '~components/Card/Card';
import { CardBack } from '~components/CardBack/CardBack';
import { FinalRoundBanner } from '~components/FinalRoundBanner/FinalRoundBanner';
import { GameOverDialog } from '~components/GameOverDialog/GameOverDialog';
import { Noble } from '~components/Noble/Noble';
import { NobleSelectDialog } from '~components/NobleSelectDialog/NobleSelectDialog';
import { Notifications } from '~components/Notifications/Notifications';
import { PlayerInfo } from '~components/PlayerInfo/PlayerInfo';
import { Reserved } from '~components/Reserved/Reserved';
import { ReturnTokensDialog } from '~components/ReturnTokensDialog/ReturnTokensDialog';
import { Token } from '~components/Token/Token';
import { playJohannaTurn } from '~src/ai/johanna';
import { type Card as CardType, useGameStore } from '~stores/game.store';
import type { TokenColorValues } from '~types/colors.type';
import { navigate } from '~utils/navigate';

import styles from './Game.module.css';

export const Game: FC = (): JSX.Element | null => {
  const {
    board,
    canEndTurn,
    commitCard,
    endTurn,
    finishTurn,
    pickedCard,
    players,
    reserveCard,
    reserveToken,
    reserveFromDeck,
    deck,
    needsNobleCheck,
    isForcedPass,
    isGameOver,
    winner,
    tiedPlayers,
    reset,
    currentPlayerIndex,
    aiPlayerIndices,
  } = useGameStore(
    useShallow((state) => ({
      board: state.board,
      commitCard: state.commitCard,
      pickedCard: state.pickedCard,
      players: state.players,
      reserveCard: state.pickCard,
      reserveToken: state.pickToken,
      reserveFromDeck: state.reserveFromDeck,
      deck: state.deck,
      canEndTurn: state.canEndTurn,
      endTurn: state.endTurn,
      finishTurn: state.finishTurn,
      needsNobleCheck: state.needsNobleCheck,
      isForcedPass: state.isForcedPass,
      isGameOver: state.isGameOver,
      winner: state.winner,
      tiedPlayers: state.tiedPlayers,
      reset: state.reset,
      currentPlayerIndex: state.currentPlayerIndex,
      aiPlayerIndices: state.aiPlayerIndices,
    })),
  );

  const [openNobleSelectDialog, setOpenNobleSelectDialog] = useState(false);
  const [pendingReservedCardIndex, setPendingReservedCardIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    setOpenNobleSelectDialog(needsNobleCheck);
  }, [needsNobleCheck]);

  useEffect(() => {
    if (isGameOver) return;
    if (!aiPlayerIndices.includes(currentPlayerIndex)) return;

    let commitTimer: ReturnType<typeof setTimeout>;

    // Phase 1 — pick action (visible in the UI)
    const pickTimer = setTimeout(() => {
      const commit = playJohannaTurn();
      // Phase 2 — commit the action after a pause so the player can see it
      commitTimer = setTimeout(commit, 1200);
    }, 600);

    return () => {
      clearTimeout(pickTimer);
      clearTimeout(commitTimer);
    };
  }, [currentPlayerIndex, isGameOver, aiPlayerIndices]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (players.length === 0) {
    navigate('/');
    return null;
  }

  const handleCardClick = (card: CardType): void => {
    reserveCard(card);
  };

  const handleTokenClick = (color: TokenColorValues): void => {
    reserveToken(color);
  };

  const handleReserveFromDeck = (level: 1 | 2 | 3): void => {
    const success = reserveFromDeck(level);
    if (!success) return;
    if (!useGameStore.getState().needToReturnTokens) {
      finishTurn();
    }
  };

  const handleEndTurn = (): void => {
    if (canEndTurn()) {
      endTurn();
    }
  };

  const handleReservedCardPurchase = (index: number): void => {
    if (pickedCard !== null) {
      return;
    }
    setPendingReservedCardIndex(index);
  };

  const handleConfirmReservedPurchase = (): void => {
    if (pendingReservedCardIndex === null) return;
    const purchased = commitCard(pendingReservedCardIndex);
    setPendingReservedCardIndex(null);
    if (!purchased) return;
    if (!useGameStore.getState().needToReturnTokens) {
      finishTurn();
    }
  };

  const handleCancelReservedPurchase = (): void => {
    setPendingReservedCardIndex(null);
  };

  const handlePlayAgain = (): void => {
    reset();
    navigate('/');
  };

  const getEndTurnLabel = (): string => {
    if (isForcedPass()) return 'Pass';
    if (pickedCard?.intent === 'reserve') return 'Reserve Card';
    if (pickedCard?.intent === 'buy') return 'Buy Card';
    return 'End Turn';
  };

  const renderLevelCards = (
    cards: CardType[],
    level: 1 | 2 | 3,
  ): JSX.Element[] => {
    const elements: JSX.Element[] = cards.map((card) => (
      <Card card={card} onClick={() => handleCardClick(card)} key={card.id} />
    ));
    if (pickedCard?.card.level === level) {
      elements.splice(
        pickedCard.boardIndex,
        0,
        <div
          key="picked-placeholder"
          className={styles.cardPlaceholder}
          aria-hidden
        />,
      );
    }
    return elements;
  };

  return (
    <>
      <FinalRoundBanner />

      <div className={styles.table}>
        <Notifications />

        <div className={styles.players}>
          {players.map((player, index) => (
            <PlayerInfo
              key={player.uuid}
              id={player.uuid}
              isAi={aiPlayerIndices.includes(index)}
              onReservedCardClick={handleReservedCardPurchase}
              pendingReservedCardIndex={pendingReservedCardIndex}
            />
          ))}
        </div>

        <div className={styles.decks}>
          <CardBack
            color="green"
            level={3}
            onClick={() => handleReserveFromDeck(3)}
            disabled={deck.filter((c) => c.level === 3).length === 0}
          />
          <CardBack
            color="yellow"
            level={2}
            onClick={() => handleReserveFromDeck(2)}
            disabled={deck.filter((c) => c.level === 2).length === 0}
          />
          <CardBack
            color="blue"
            level={1}
            onClick={() => handleReserveFromDeck(1)}
            disabled={deck.filter((c) => c.level === 1).length === 0}
          />
        </div>

        <div className={styles.cards}>
          {renderLevelCards(board.cards.level3, 3)}
          {renderLevelCards(board.cards.level2, 2)}
          {renderLevelCards(board.cards.level1, 1)}
        </div>

        <div className={styles.tokens}>
          <Token label="Gold token" color="gold" quantity={board.tokens.gold} />
          <Token
            label="Black"
            onClick={() => handleTokenClick('black')}
            color="black"
            quantity={board.tokens.black}
          />
          <Token
            label="Blue"
            onClick={() => handleTokenClick('blue')}
            color="blue"
            quantity={board.tokens.blue}
          />
          <Token
            label="Green"
            onClick={() => handleTokenClick('green')}
            color="green"
            quantity={board.tokens.green}
          />
          <Token
            label="Red"
            onClick={() => handleTokenClick('red')}
            color="red"
            quantity={board.tokens.red}
          />
          <Token
            label="White"
            onClick={() => handleTokenClick('white')}
            color="white"
            quantity={board.tokens.white}
          />
        </div>

        <div className={styles.nobles}>
          {board.nobles.map((noble) => (
            <Noble key={noble.id} noble={noble} showHighlight />
          ))}
        </div>

        <div className={styles.currentPlayerHud}>
          <Reserved />
          {pendingReservedCardIndex !== null && (
            <div className={styles.reservedConfirm}>
              <span>Buy reserved card?</span>
              <button
                type="button"
                className={styles.endTurnButton}
                onClick={handleConfirmReservedPurchase}
              >
                Confirm
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancelReservedPurchase}
              >
                Cancel
              </button>
            </div>
          )}
          {canEndTurn() && pendingReservedCardIndex === null && (
            <button
              className={styles.endTurnButton}
              type="button"
              onClick={handleEndTurn}
              disabled={!canEndTurn()}
            >
              {getEndTurnLabel()}
            </button>
          )}
        </div>
      </div>

      <NobleSelectDialog
        open={openNobleSelectDialog}
        onOpenChange={setOpenNobleSelectDialog}
      />

      <ReturnTokensDialog />

      <GameOverDialog
        open={isGameOver}
        players={players}
        winner={winner}
        tiedPlayers={tiedPlayers}
        onPlayAgain={handlePlayAgain}
      />
    </>
  );
};
