import { FC, useEffect } from 'react';
import { useGameStore } from '../../stores/game.store';

import { Card } from '../../components/card/card.component';
import { Token } from '../../components/token/token.component';
import { CardBack } from '../../components/card-back/card-back.component';
import { Noble } from '../../components/noble/noble.component';
import styles from './Game.module.scss';
import { PlayerInfo } from '../../components/player-info/player-info.component';
import { Uuid } from '../../types/utils.types';
import { TokenColorValues } from '../../types/colors.type';

export const Game: FC = (): JSX.Element => {
  const { board, init } = useGameStore();
  useEffect(() => init(), [init]);

  const handleCardClick = (id: Uuid, level: number): void => {
    console.info(id, level);
  }

  const handleTokenClick = (color: TokenColorValues): void => {
    console.info(color);
  }

  return (
    <div className={styles.table}>
      <div className={styles.players}>
        <PlayerInfo />
        <PlayerInfo />
        <PlayerInfo />
        <PlayerInfo />
      </div>

      <div className={styles.decks}>
        <CardBack color="green" level={3} />
        <CardBack color="yellow" level={2} />
        <CardBack color="blue" level={1} />
      </div>

      <div className={styles.cards}>
        {board.cards.level3.map((card) => (
          <Card
            onClick={() => handleCardClick(card.id, card.level)}
            key={card.id}
            level={card.level}
            gemColor={card.gemColor}
            price={card.price}
            gemQuantity={card.gemQuantity}
          />
        ))}
        {board.cards.level2.map((card) => (
          <Card
            onClick={() => handleCardClick(card.id, card.level)}
            key={card.id}
            level={card.level}
            gemColor={card.gemColor}
            price={card.price}
            gemQuantity={card.gemQuantity}
          />
        ))}
        {board.cards.level1.map((card) => (
          <Card
            onClick={() => handleCardClick(card.id, card.level)}
            key={card.id}
            level={card.level}
            gemColor={card.gemColor}
            price={card.price}
            gemQuantity={card.gemQuantity}
          />
        ))}
      </div>

      <div className={styles.tokens}>
        <Token color="gold" label={5} />
        <Token onClick={() => handleTokenClick('black')} color="black" label={board.tokens.black} />
        <Token onClick={() => handleTokenClick('blue')} color="blue" label={board.tokens.blue} />
        <Token onClick={() => handleTokenClick('green')} color="green" label={board.tokens.green} />
        <Token onClick={() => handleTokenClick('red')} color="red" label={board.tokens.red} />
        <Token onClick={() => handleTokenClick('white')} color="white" label={board.tokens.white} />
      </div>

      <div className={styles.nobles}>
        {board.nobles.map((noble) => (
          <Noble key={noble.id} price={noble.price} prestige={noble.prestige} />
        ))}
      </div>
    </div>
  )
}
