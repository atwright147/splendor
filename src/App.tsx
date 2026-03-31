import { useRoutes } from 'raviger';
import '@fontsource/noticia-text';
import type { JSX } from 'react';

import { Game } from '#routes/Game/Game.tsx';
import { Home } from '#routes/Home/Home.tsx';
import { Root } from '#routes/Root/Root.tsx';

import 'normalize.css';
import './index.css';

const routes = {
  '/': () => <Home />,
  '/game': () => <Game />,
};

export const App = (): JSX.Element => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const route = useRoutes(routes, { basePath: base });

  return <Root>{route}</Root>;
};
