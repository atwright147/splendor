import { type FC, useEffect } from 'react';
import { type Card as CardType, useGameStore } from '../../stores/game.store';

import { useShallow } from 'zustand/shallow';
import { Card } from '../../components/Card/Card';
import { CardBack } from '../../components/CardBack/CardBack';
import { MainPlayerInfo } from '../../components/MainPlayerInfo/MainPlayerInfo';
import { Noble } from '../../components/Noble/Noble';
import { PlayerInfo } from '../../components/PlayerInfo/PlayerInfo';
import { Token } from '../../components/Token/Token';
import type { TokenColorValues } from '../../types/colors.type';
import { Uuid } from '../../types/utils.types';

import { Notifications } from '../../components/Notifications/Notifications';
import { Reserved } from '../../components/Reserved/Reserved';
import styles from './Game.module.scss';

export const Game: FC = (): JSX.Element => {
  const {
    board,
    createPlayers,
    deal,
    init,
    setBoardSnapshot,
    nextPlayer,
    players,
    reserveCard,
    reserveToken,
    commitCard,
  } = useGameStore(
    useShallow((state) => ({
      board: state.board,
      createPlayers: state.createPlayers,
      deal: state.deal,
      init: state.init,
      setBoardSnapshot: state.setBoardSnapshot,
      nextPlayer: state.nextPlayer,
      players: state.players,
      reserveCard: state.pickCard,
      reserveToken: state.pickToken,
      commitCard: state.commitCard,
    })),
  );

  useEffect(() => {
    createPlayers(2);
    init();
    deal();
    setBoardSnapshot();
  }, [createPlayers, deal, init, setBoardSnapshot]);

  const handleCardClick = (card: CardType): void => {
    reserveCard(card);
  };

  const handleTokenClick = (color: TokenColorValues): void => {
    reserveToken(color);
  };

  return (
    <div className={styles.table}>
      <Notifications />

      <div className={styles.players}>
        {players.map((player) => (
          <PlayerInfo
            key={player.uuid}
            tokens={player.tokens}
            cards={player.cards}
          />
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
            onClick={() => handleCardClick(card)}
            key={card.id}
            level={card.level}
            cost={card.cost}
            token={card.token}
            prestige={card.prestige}
          />
        ))}
        {board.cards.level2.map((card) => (
          <Card
            onClick={() => handleCardClick(card)}
            key={card.id}
            level={card.level}
            cost={card.cost}
            token={card.token}
            prestige={card.prestige}
          />
        ))}
        {board.cards.level1.map((card) => (
          <Card
            onClick={() => handleCardClick(card)}
            key={card.id}
            level={card.level}
            cost={card.cost}
            token={card.token}
            prestige={card.prestige}
          />
        ))}
      </div>

      <div className={styles.tokens}>
        <Token color="gold" label={5} quantity={5} />
        <Token
          onClick={() => handleTokenClick('black')}
          color="black"
          quantity={board.tokens.black}
        />
        <Token
          onClick={() => handleTokenClick('blue')}
          color="blue"
          quantity={board.tokens.blue}
        />
        <Token
          onClick={() => handleTokenClick('green')}
          color="green"
          quantity={board.tokens.green}
        />
        <Token
          onClick={() => handleTokenClick('red')}
          color="red"
          quantity={board.tokens.red}
        />
        <Token
          onClick={() => handleTokenClick('white')}
          color="white"
          quantity={board.tokens.white}
        />
      </div>

      <div className={styles.nobles}>
        {board.nobles.map((noble) => (
          <Noble key={noble.id} cost={noble.cost} prestige={noble.prestige} />
        ))}
      </div>

      <div className={styles.mainPlayerInfo}>
        {/* <MainPlayerInfo /> */}
        <Reserved />
      </div>
    </div>
  );
};
