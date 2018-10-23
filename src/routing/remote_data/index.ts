import { curry } from 'ramda';

export const LOADED = 'loaded';
export const NOT_LOADED = 'not_loaded';
export const RELOADING = 'reloading';
export const ERROR = 'errored';
export const LOADING = 'loading';

export type NotLoaded = { state: 'not_loaded' };
export type Loading = { state: 'loading' };
export type Loaded<T> = { state: 'loaded', data: T };
export type Reloading<T> = { state: 'reloading', data: T };
export type Errored = { state: 'errored', error: any };

export type State = 'loading' | 'not_loaded' | 'loaded' | 'reloading' | 'errored';

export const notLoaded = (): NotLoaded => ({ state: NOT_LOADED });
export const loading = (): Loading => ({ state: LOADING });
export const loaded = <T>(data: T): Loaded<T> => ({ state: LOADED, data });
export const reloading = <T>({ data }: Loaded<T>): Reloading<T> => ({ state: RELOADING, data });
export const errored = (error): Errored => ({ state: ERROR, error });

export interface CurriedFunction1<T1, R> {
  (v1: T1): R; // tslint:disable-line:callable-types
}

interface CurriedFunction2<T1, T2, R> {
  (v1: T1): CurriedFunction1<T2, R>;
  (v1: T1, v2: T2): R;
}

export const is: CurriedFunction2<State, RemoteData<any>, boolean> =
  curry((type: State, data: RemoteData<any>) => data && data.state === type);

export type RemoteData<T>
  = NotLoaded
  | Loading
  | Loaded<T>
  | Errored
  | Reloading<T>;
