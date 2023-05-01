import { useState } from 'react';
import cardsJson from '../ref/cards.json';

import styles from './App.module.scss';
import { Card } from './components/card/card.component';

export const App = (): JSX.Element => {
  const [cards, setCards] = useState<any>(cardsJson);

  return (
    <div className={styles.table}>
      <div className={styles.deck}>
        {cards.map((card) => (
          <Card level={card.level} gemColor={card.gemColor} price={card.price} gemQuantity={card.gemQuantity} />
        ))}
      </div>
    </div>
  )
}
