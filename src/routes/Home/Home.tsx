import type { JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useShallow } from 'zustand/shallow';

import { useGameStore } from '~stores/game.store';
import { navigate } from '~utils/navigate';
import styles from './Home.module.css';

type HomeFormValues = {
  playerCount: number;
  botCount: number;
};

export const Home = (): JSX.Element => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<HomeFormValues>({
    defaultValues: {
      playerCount: 2,
      botCount: 1,
    },
  });
  const { createPlayers, deal, init, setBoardSnapshot } = useGameStore(
    useShallow((state) => ({
      createPlayers: state.createPlayers,
      deal: state.deal,
      init: state.init,
      setBoardSnapshot: state.setBoardSnapshot,
    })),
  );
  const playerCount = watch('playerCount');

  const onSubmit = ({ playerCount, botCount }: HomeFormValues): void => {
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

        <form
          action=""
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className={styles.field}>
            <label htmlFor="player-count">Number of Players:</label>
            <Controller
              name="playerCount"
              control={control}
              rules={{
                min: {
                  value: 2,
                  message: 'Number of players must be between 2 and 4.',
                },
                max: {
                  value: 4,
                  message: 'Number of players must be between 2 and 4.',
                },
              }}
              render={({ field }) => (
                <input
                  type="number"
                  className={styles.input}
                  id="player-count"
                  min="2"
                  max="4"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(Number(event.target.value));
                  }}
                />
              )}
            />
            {errors.playerCount && (
              <p role="alert">{errors.playerCount.message}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="bot-count">Number of Bots (Johanna):</label>
            <Controller
              name="botCount"
              control={control}
              rules={{
                min: {
                  value: 0,
                  message:
                    'Number of bots must be between 0 and total players minus 1.',
                },
                validate: (value, { playerCount }) =>
                  value < playerCount ||
                  'Number of bots must be between 0 and total players minus 1.',
              }}
              render={({ field }) => (
                <input
                  type="number"
                  className={styles.input}
                  id="bot-count"
                  min="0"
                  max={Math.max(0, playerCount - 1)}
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(Number(event.target.value));
                  }}
                />
              )}
            />
            {errors.botCount && <p role="alert">{errors.botCount.message}</p>}
          </div>

          <button type="submit">Start Game</button>
        </form>
      </div>
    </div>
  );
};
