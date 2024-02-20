import { validate as uuidValidate } from 'uuid';

export type Uuid = string;

export const isUuid = (value: unknown): value is Uuid => {
  return uuidValidate(value);
};
