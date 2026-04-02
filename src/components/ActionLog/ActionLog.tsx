import type { FC, JSX } from 'react';
import { useShallow } from 'zustand/shallow';

import { useActionLogStore } from '~stores/actionLog.store';

import styles from './ActionLog.module.css';

const MAX_VISIBLE_ENTRIES = 30;

export const ActionLog: FC = (): JSX.Element => {
  const entries = useActionLogStore(useShallow((state) => state.entries));

  const latestEntries = entries.slice(-MAX_VISIBLE_ENTRIES);
  const newestFirstEntries = [...latestEntries].reverse();

  return (
    <details className={styles.panel}>
      <summary className={styles.summary}>
        Action Log ({entries.length})
      </summary>

      <div className={styles.content}>
        {latestEntries.length === 0 ? (
          <p className={styles.empty}>No actions yet.</p>
        ) : (
          <ol className={styles.list} reversed start={entries.length}>
            {newestFirstEntries.map((entry) => (
              <li key={entry.id} className={styles.item}>
                {entry.message}
              </li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
};
