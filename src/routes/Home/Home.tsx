import { navigate } from 'raviger';
import { type JSX, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useGameStore } from '#stores/game.store';
import styles from './Home.module.css';

export const Home = (): JSX.Element => {
  const [playerCount, setPlayerCount] = useState(2);
  const [botCount, setBotCount] = useState(2);
  const { createPlayers, deal, init, setBoardSnapshot } = useGameStore(
    useShallow((state) => ({
      createPlayers: state.createPlayers,
      deal: state.deal,
      init: state.init,
      setBoardSnapshot: state.setBoardSnapshot,
    })),
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    createPlayers(playerCount);
    init();
    deal();
    setBoardSnapshot();

    navigate('/game');
  };

  return (
    <div className="container">
      <h1>Splendor</h1>

      <div className="player-selection">
        <h2>Select number of players:</h2>

        <form action="" className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="player-count">Number of Players:</label>
            <input
              type="number"
              className={styles.input}
              id="player-count"
              min="2"
              max="4"
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="bot-count">Number of Bots:</label>
            <input
              type="number"
              className={styles.input}
              id="bot-count"
              min="2"
              max="4"
              value={botCount}
              onChange={(e) => setBotCount(Number(e.target.value))}
              disabled
            />
          </div>

          <button type="submit">Start Game</button>
        </form>
      </div>

      {/* <Link to="/game" onClick={handleStartGame} className="start-button">
        Start Game
      </Link> */}
    </div>
  );
};
