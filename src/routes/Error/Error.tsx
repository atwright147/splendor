import { useRouteError } from 'react-router-dom';

interface RouterError {
  status: number;
  statusText: string;
  message: string;
  internal: boolean;
  data: string;
  error: {
    message: string;
    stack: string;
  };
}

export const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>
          {(error as RouterError).statusText}: {(error as RouterError).error.message}
        </i>
      </p>
    </div>
  );
};
