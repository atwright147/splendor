import React from 'react'
import ReactDOM from 'react-dom/client'
import "@fontsource/noticia-text"
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { Root } from './routes/Root/Root.tsx'
import { ErrorPage } from './routes/Error/Error.tsx'
import { Home } from './routes/Home/Home.tsx'
import { Game } from './routes/Game/Game.tsx'

import 'normalize.css';
import './index.scss'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/game',
        element: <Game />,
      },
    ],
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
