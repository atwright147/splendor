import { useGameStore } from '../../stores/game.store';

import { Card } from '../../components/card/card.component';
import { Token } from '../../components/token/token.component';
import { CardBack } from '../../components/card-back/card-back.component';
import { Noble } from '../../components/noble/noble.component';
import styles from './Game.module.scss';
import { PlayerInfo } from '../../components/player-info/player-info.component';

export const Game = (): JSX.Element => {
  const { board, init } = useGameStore();
  useEffect(() => init(), [init]);

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
          <Card level={card.level} gemColor={card.gemColor} price={card.price} gemQuantity={card.gemQuantity} />
        ))}
        {board.cards.level2.map((card) => (
          <Card level={card.level} gemColor={card.gemColor} price={card.price} gemQuantity={card.gemQuantity} />
        ))}
        {board.cards.level1.map((card) => (
          <Card level={card.level} gemColor={card.gemColor} price={card.price} gemQuantity={card.gemQuantity} />
        ))}
      </div>

      <div className={styles.tokens}>
        <Token color="gold" label={5} />
        <Token color="black" label={board.tokens.black} />
        <Token color="blue" label={board.tokens.blue} />
        <Token color="green" label={board.tokens.green} />
        <Token color="red" label={board.tokens.red} />
        <Token color="white" label={board.tokens.white} />
      </div>

      <div className={styles.nobles}>
        {board.nobles.map((noble) => (
          <Noble price={noble.price} prestige={noble.prestige} />
        ))}
      </div>
    </div>
  )
}
