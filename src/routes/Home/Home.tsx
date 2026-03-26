import { navigate } from 'raviger';
import { type JSX, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useGameStore } from '#stores/game.store';
import styles from './Home.module.css';

export const Home = (): JSX.Element => {
  const [playerCount, setPlayerCount] = useState(2);
  const [playerCountError, setPlayerCountError] = useState('');
  const [botCount, setBotCount] = useState(1);
  const [botCountError, setBotCountError] = useState('');
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

    if (playerCount < 2 || playerCount > 4) {
      setPlayerCountError('Number of players must be between 2 and 4.');
      return;
    }

    if (botCount < 0 || botCount >= playerCount) {
      setBotCountError(
        'Number of bots must be between 0 and total players minus 1.',
      );
      return;
    }

    setPlayerCountError('');
    setBotCountError('');
    createPlayers(playerCount, botCount);
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
              onChange={(e) => {
                setPlayerCount(Number(e.target.value));
                setPlayerCountError('');
              }}
            />
            {playerCountError && <p role="alert">{playerCountError}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="bot-count">Number of Bots (Johanna):</label>
            <input
              type="number"
              className={styles.input}
              id="bot-count"
              min="0"
              max={playerCount - 1}
              value={botCount}
              onChange={(e) => {
                setBotCount(Number(e.target.value));
                setBotCountError('');
              }}
            />
            {botCountError && <p role="alert">{botCountError}</p>}
          </div>

          <button type="submit">Start Game</button>
        </form>
      </div>
    </div>
  );
};
