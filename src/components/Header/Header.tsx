import { FC, ReactNode } from 'react';
import styles from './Header.module.scss';

interface Props {
  children: ReactNode,
}

export const Header: FC<Props> = ({ children }): JSX.Element => (
  <header className={styles.header}>
    {children}
  </header>
);
