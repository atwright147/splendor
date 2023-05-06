import { Outlet } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
// import { Nav } from '../../components/Nav/Nav';
import { Spinner } from '../../components/Spinner/Spinner';

import './Root.scss'

export const Root = (): JSX.Element => (
  <>
    <Spinner />

    <div className="app grid">
      <div className="header">
        <Header>
          <div className="left">
            Splendor
          </div>
          <div className="right">
            :)
          </div>
        </Header>
      </div>
      {/* <div className="aside">
        <Nav />
      </div> */}
      <div className="main">
        <Outlet />
      </div>
      <div className="footer">Footer</div>
    </div>
  </>
);
