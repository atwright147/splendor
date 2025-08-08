import { type FC, type JSX, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { Card } from '#components/Card/Card';
import { CardBack } from '#components/CardBack/CardBack';
import { NobleSelectDialog } from '#components/NobelSelectDialog/NobelSelectDialog';
import { Noble } from '#components/Noble/Noble';
import { Notifications } from '#components/Notifications/Notifications';
import { PlayerInfo } from '#components/PlayerInfo/PlayerInfo';
import { Reserved } from '#components/Reserved/Reserved';
import { Token } from '#components/Token/Token';
import { type Card as CardType, useGameStore } from '#stores/game.store';
import type { TokenColorValues } from '#types/colors.type';

import styles from './Game.module.css';

export const Game: FC = (): JSX.Element => {
  const {
    board,
    canEndTurn,
    endTurn,
    createPlayers,
    deal,
    init,
    setBoardSnapshot,
    players,
    reserveCard,
    reserveToken,
    hasAffordableNobles,
  } = useGameStore(
    useShallow((state) => ({
      board: state.board,
      createPlayers: state.createPlayers,
      deal: state.deal,
      init: state.init,
      setBoardSnapshot: state.setBoardSnapshot,
      players: state.players,
      reserveCard: state.pickCard,
      reserveToken: state.pickToken,
      canEndTurn: state.canEndTurn,
      endTurn: state.endTurn,
      hasAffordableNobles: state.hasAffordableNobles,
    })),
  );

  // useEffect(() => {
  //   createPlayers(2);
  //   init();
  //   deal();
  //   setBoardSnapshot();
  // }, [createPlayers, deal, init, setBoardSnapshot]);

  const [openNobleSelectDialog, setOpenNobleSelectDialog] = useState(false);

  const handleCardClick = (card: CardType): void => {
    reserveCard(card);
  };

  const handleTokenClick = (color: TokenColorValues): void => {
    reserveToken(color);
  };

  const handleEndTurn = (): void => {
    if (hasAffordableNobles()) {
      setOpenNobleSelectDialog(true);
      return;
    }

    if (canEndTurn()) {
      endTurn();
    }
  };

  return (
    <>
      <div className={styles.table}>
        <Notifications />

        <div className={styles.players}>
          {players.map((player) => (
            <PlayerInfo key={player.uuid} id={player.uuid} />
          ))}
        </div>

        <div className={styles.decks}>
          <CardBack color="green" level={3} />
          <CardBack color="yellow" level={2} />
          <CardBack color="blue" level={1} />
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
              End Turn?
            </button>
          )}
        </div>
      </div>

      <NobleSelectDialog
        open={openNobleSelectDialog}
        onOpenChange={setOpenNobleSelectDialog}
      />
    </>
  );
};
