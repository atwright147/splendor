import { NavLink } from 'react-router-dom';

import styles from './Nav.module.scss';

export const Nav = (): JSX.Element => (
  <nav className={styles.nav} aria-label="Primary">
    <h2>Routes</h2>
    <NavLink className={styles.link} to="/">Home</NavLink>
    <NavLink className={styles.link} to="/drag-and-drop">Drag and Drop</NavLink>
    <NavLink className={styles.link} to="/todos">Todos</NavLink>
    <NavLink className={styles.link} to="/starwars">Star Wars</NavLink>
    <NavLink className={styles.link} to="/reactflow">React Flow</NavLink>
    <hr />
    <h2>Components</h2>
    <NavLink className={styles.link} to="/components/accordion">Accordion</NavLink>
    <NavLink className={styles.link} to="/components/button">Button</NavLink>
    <NavLink className={styles.link} to="/components/fields">Fields</NavLink>
    <NavLink className={styles.link} to="/components/form">Form</NavLink>
    <NavLink className={styles.link} to="/components/popover">Popover</NavLink>
  </nav>
);
