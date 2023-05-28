import { validate as uuidValidate } from 'uuid';

export type Uuid = string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isUuid = (value: any): value is Uuid => {
  return uuidValidate(value);
}
