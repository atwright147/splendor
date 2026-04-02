import type { JSX } from 'react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useShallow } from 'zustand/shallow';

import { useGameStore } from '~stores/game.store';
import { navigate } from '~utils/navigate';
import styles from './Home.module.css';

type PlayerType = 'human' | string;

type HomeFormValues = {
  playerCount: number;
  players: Array<{
    type: PlayerType;
  }>;
};

const aiAgentOptions = Object.keys(import.meta.glob('/src/ai/*.ts'))
  .map((path) => path.split('/').pop()?.replace('.ts', '') ?? '')
  .filter((name) => name.length > 0 && name !== 'basicPlayer')
  .sort((a, b) => a.localeCompare(b));

const playerDescriptions: Record<string, string> = {
  human: 'You control this player',
  eve: 'Tries to block opponents by securing colours that appear in nobles',
  joe: 'A solid standard opponent',
  johanna: 'Strongest opponent, strategically targets noble-required cards (~64% win rate)',
  ryan: 'Less intelligent, makes random decisions',
};

const playerTypeOptions: Array<{ value: PlayerType; label: string; description: string }> = [
  { value: 'human', label: 'Human (local)', description: playerDescriptions.human },
  ...aiAgentOptions.map((agentName) => ({
    value: agentName,
    label: agentName.charAt(0).toUpperCase() + agentName.slice(1),
    description: playerDescriptions[agentName] || 'An AI opponent',
  })),
];

export const Home = (): JSX.Element => {
  const {
    control,
    clearErrors,
    getValues,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<HomeFormValues>({
    defaultValues: {
      playerCount: 2,
      players: [{ type: 'human' }, { type: 'human' }],
    },
  });
  const { fields, replace } = useFieldArray({
    control,
    name: 'players',
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
  useEffect(() => {
    const currentPlayers = getValues('players');

    if (currentPlayers.length === playerCount) {
      return;
    }

    const nextPlayers = Array.from({ length: playerCount }, (_, index) => ({
      type: currentPlayers[index]?.type ?? 'human',
    }));

    replace(nextPlayers);
  }, [getValues, playerCount, replace]);

  const onSubmit = ({ playerCount, players }: HomeFormValues): void => {
    clearErrors('players');
    createPlayers(
      playerCount,
      players.map((player) => player.type),
    );
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

          <fieldset className={styles.fieldset}>
            <legend>Players</legend>
            <div className={styles.playersContainer}>
              {fields.map((field, index) => (
                <div className={styles.field} key={field.id}>
                  <label htmlFor={`player-type-${index + 1}`}>
                    Player {index + 1}
                  </label>
                  <Controller
                    name={`players.${index}.type`}
                    control={control}
                    rules={{
                      required: 'Choose a player type.',
                    }}
                     render={({ field }) => {
                       const selectedPlayer = playerTypeOptions.find(
                         (opt) => opt.value === field.value,
                       );
                       return (
                         <>
                           <select
                             className={styles.input}
                             id={`player-type-${index + 1}`}
                             name={field.name}
                             ref={field.ref}
                             value={field.value}
                             onBlur={field.onBlur}
                             onChange={(event) => {
                               field.onChange(event.target.value);
                             }}
                           >
                             {playerTypeOptions.map((option) => (
                               <option key={option.value} value={option.value}>
                                 {option.label}
                               </option>
                             ))}
                           </select>
                           {selectedPlayer && (
                             <p className={styles.description}>
                               {selectedPlayer.description}
                             </p>
                           )}
                         </>
                       );
                     }}
                  />
                  {errors.players?.[index]?.type && (
                    <p role="alert">{errors.players[index]?.type?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </fieldset>

          <button type="submit">Start Game</button>
        </form>
      </div>
    </div>
  );
};
