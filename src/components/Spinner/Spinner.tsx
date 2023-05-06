import { FC } from 'react';
import { useSpinnerStore } from '../../stores/spinner.store';
import styles from './Spinner.module.scss';

export const Spinner: FC = (): JSX.Element | null => {
  const { count } = useSpinnerStore();

  if (!count) {
    return null;
  }

  return (
    <div className={styles.spinner}>
      <p className={styles.info} aria-live="assertive" aria-busy="true">Loading&hellip;</p>
    </div>
  );
};
