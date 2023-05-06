import { Link } from 'react-router-dom';

export const Home = (): JSX.Element => (
  <div className="container">
    <p>Home works!</p>
    <Link to="/game">Play</Link>
  </div>
);
