import { navigate as ravigerNavigate } from 'raviger';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const navigate = (path: string): void => {
  ravigerNavigate(base + path);
};
