import { useEffect } from 'react';

// https://stackoverflow.com/a/64049023/633056
export const useTitle = (title: string): void => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};
