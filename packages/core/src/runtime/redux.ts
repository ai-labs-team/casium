import { identity, pipe, prop } from 'ramda';
import Message, { Constructor } from '../message';
import { replace } from '../util';
import ExecContext from './exec_context';

export type Action<Data, Name extends string> = Data & {
  type: Name;
};

export type MessageMap<Data> = {
  [key: string]: Constructor<Data, Message<Data>>;
};

export type Store = {
  getState(): object;
  subscribe(cb: (val: object) => void): void;
};

export type Config = {
  key?: string;
  store: Store;
};

/**
 * Attaches a container's state manager to a Redux store to receive updates.
 *
 * @param  {Object} config The attachment configuration
 * @param  {Object} container The container
 * @return {Object} Returns the store's current state to use as the container's initial state
 */
export const attachStore = (config: Config, ctx: ExecContext<any>) => {
  const getState = () => ((config.key && prop(config.key) || identity) as (o: object) => any)(
    config.store.getState()
  );
  config.store.subscribe(pipe(getState, replace(ctx.state()), ctx.push.bind(ctx)));
  return getState();
};

/**
 * Receives a Redux action and, if that action has been mapped to a container message constructor,
 * dispatches a message of the matching type to the container.
 *
 * @param  exec An executor bound to a container
 * @param  messageTypes An object that pairs one or more Redux action types to message
 *                  constructors
 * @param  action A Redux action
 */
export const dispatchAction = <Model, Name extends string, Data>(
  exec: ExecContext<Model>,
  msgTypes: MessageMap<Action<Data, Name>>,
  action: Action<Data, Name>
) => {
  action && action.type && msgTypes[action.type] && exec.dispatch(new msgTypes[action.type](action));
};
