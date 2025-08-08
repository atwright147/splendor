import type { JSX } from 'react';

import { Header } from '#components/Header/Header';

import './Root.css';

export const Root = ({ children }): JSX.Element => (
  <>
    <div className="app grid">
      <div className="header">
        <Header>
          <div className="left">Splendor</div>
          <div className="right">:)</div>
        </Header>
      </div>
      {/* <div className="aside">
        <Nav />
      </div> */}
      <div className="main">{children}</div>
      <div className="footer">Footer</div>
    </div>
  </>
);
