import { navigate } from 'raviger';
import { type FC, type JSX, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { Card } from '#components/Card/Card';
import { CardBack } from '#components/CardBack/CardBack';
import { FinalRoundBanner } from '#components/FinalRoundBanner/FinalRoundBanner';
import { GameOverDialog } from '#components/GameOverDialog/GameOverDialog';
import { Noble } from '#components/Noble/Noble';
import { NobleSelectDialog } from '#components/NobleSelectDialog/NobleSelectDialog';
import { Notifications } from '#components/Notifications/Notifications';
import { PlayerInfo } from '#components/PlayerInfo/PlayerInfo';
import { Reserved } from '#components/Reserved/Reserved';
import { ReturnTokensDialog } from '#components/ReturnTokensDialog/ReturnTokensDialog';
import { Token } from '#components/Token/Token';
import { type Card as CardType, useGameStore } from '#stores/game.store';
import type { TokenColorValues } from '#types/colors.type';

import styles from './Game.module.css';

export const Game: FC = (): JSX.Element | null => {
  const {
    board,
    canEndTurn,
    commitCard,
    endTurn,
    createPlayers,
    deal,
    init,
    setBoardSnapshot,
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
  } = useGameStore(
    useShallow((state) => ({
      board: state.board,
      createPlayers: state.createPlayers,
      commitCard: state.commitCard,
      deal: state.deal,
      init: state.init,
      setBoardSnapshot: state.setBoardSnapshot,
      players: state.players,
      reserveCard: state.pickCard,
      reserveToken: state.pickToken,
      reserveFromDeck: state.reserveFromDeck,
      deck: state.deck,
      canEndTurn: state.canEndTurn,
      endTurn: state.endTurn,
      needsNobleCheck: state.needsNobleCheck,
      isForcedPass: state.isForcedPass,
      isGameOver: state.isGameOver,
      winner: state.winner,
      tiedPlayers: state.tiedPlayers,
      reset: state.reset,
    })),
  );

  useEffect(() => {
    if (players.length > 0) {
      return;
    }

    console.info('Game state stubbed to help development.');

    createPlayers(2);
    init();
    deal();
    setBoardSnapshot();
  }, [createPlayers, deal, init, players, setBoardSnapshot]);

  const [openNobleSelectDialog, setOpenNobleSelectDialog] = useState(false);

  useEffect(() => {
    setOpenNobleSelectDialog(needsNobleCheck);
  }, [needsNobleCheck]);

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
    const state = useGameStore.getState();
    if (!state.needToReturnTokens) {
      endTurn();
    }
  };

  const handleEndTurn = (): void => {
    if (canEndTurn()) {
      endTurn();
    }
  };

  const handleReservedCardPurchase = (index: number): void => {
    const purchased = commitCard(index);
    if (!purchased) return;

    const state = useGameStore.getState();
    if (!state.needToReturnTokens) {
      endTurn();
    }
  };

  const handlePlayAgain = (): void => {
    reset();
    navigate('/');
  };

  return (
    <>
      <FinalRoundBanner />

      <div className={styles.table}>
        <Notifications />

        <div className={styles.players}>
          {players.map((player) => (
            <PlayerInfo
              key={player.uuid}
              id={player.uuid}
              onReservedCardClick={handleReservedCardPurchase}
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
          {board.cards.level3.map((card) => (
            <Card
              card={card}
              onClick={() => handleCardClick(card)}
              key={card.id}
            />
          ))}
          {board.cards.level2.map((card) => (
            <Card
              card={card}
              onClick={() => handleCardClick(card)}
              key={card.id}
            />
          ))}
          {board.cards.level1.map((card) => (
            <Card
              card={card}
              onClick={() => handleCardClick(card)}
              key={card.id}
            />
          ))}
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
          {canEndTurn() && (
            <button
              className={styles.endTurnButton}
              type="button"
              onClick={handleEndTurn}
              disabled={!canEndTurn()}
            >
              {isForcedPass() ? 'Pass' : 'End Turn?'}
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
