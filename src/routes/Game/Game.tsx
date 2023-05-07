import { useState } from 'react';
import cardsJson from '../../../ref/cards.json';
import noblesJson from '../../../ref/nobles.json';

import { Card } from '../../components/card/card.component';
import { Token } from '../../components/token/token.component';
import { TokenColorsType } from '../../types/colors.type';
import { CardBack } from '../../components/card-back/card-back.component';
import { Noble } from '../../components/noble/noble.component';
import styles from './Game.module.scss';
import { PlayerInfo } from '../../components/player-info/player-info.component';

export const Game = (): JSX.Element => {
  const [cards, setCards] = useState<any>(cardsJson);
  const [nobles, setNobles] = useState<any>(noblesJson);
  const [tokens, setTokens] = useState([
    { quantity: 4, color: 'gold' as TokenColorsType },
    { quantity: 4, color: 'black' as TokenColorsType },
    { quantity: 4, color: 'red' as TokenColorsType },
    { quantity: 4, color: 'green' as TokenColorsType },
    { quantity: 4, color: 'blue' as TokenColorsType },
    { quantity: 4, color: 'white' as TokenColorsType },
  ]);

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
        {cards.map((card) => (
          <Card level={card.level} gemColor={card.gemColor} price={card.price} gemQuantity={card.gemQuantity} />
        ))}
      </div>

      <div className={styles.tokens}>
        {tokens.map((token) => (
          <Token color={token.color} label={token.color} />
        ))}
      </div>

      <div className={styles.nobles}>
        {nobles.map((noble) => (
          <Noble price={noble.price} prestige={noble.prestige} />
        ))}
      </div>
    </div>
  )
}
