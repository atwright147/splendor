import type { FC } from 'react';
import { useShallow } from 'zustand/shallow';

import { useNotificationStore } from '../../stores/notifications.store';

import styles from './Notifications.module.scss';

export const Notifications: FC = () => {
  const { notifications, remove } = useNotificationStore(
    useShallow((store) => ({
      notifications: store.notifications,
      remove: store.remove,
    })),
  );

  return (
    <div className={styles.container}>
      {notifications.map((notification) => (
        <section key={notification.id} className={styles.notification}>
          <p className={styles.message}>{notification.message}</p>

          <button
            className={styles.close}
            type="button"
            onClick={() => remove(notification.id)}
          >
            &times;
          </button>
        </section>
      ))}
    </div>
  );
};
