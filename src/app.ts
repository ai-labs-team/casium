import {
  always, constructN, curry, defaultTo, evolve, flatten, identity as id,
  ifElse, is, map, merge, nthArg, omit, pick, pipe, splitEvery
} from 'ramda';

import * as React from 'react';

import { defaultEnv, environment, Environment } from './environment';
import ExecContext from './exec_context';
import Message from './message';
import StateManager from './state_manager';
import { result } from './util';
import ViewWrapper from './view_wrapper';

/**
 *  A global symbol that allows users to opt into what is currently the default delegate behavior
 *  i.e when a delegate is unspecified, the container is hoisted into it's parent state
 */
export const PARENT = Symbol.for('@delegate/parent');

export interface MessageConstructor {
  new(data?: any, opts?: any): Message;
}

export type MessageOrEmpty = Message | false | null | undefined;

export type UpdateResult<M> = M |
  [M] |
  [M, MessageOrEmpty] |
  [M, MessageOrEmpty, MessageOrEmpty] |
  [M, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty] |
  [M, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty] |
  [M, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty] |
  [
    M, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty,
    MessageOrEmpty, MessageOrEmpty
  ] |
  [
    M, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty,
    MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty
  ] |
  [
    M, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty,
    MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty
  ];

export type GenericObject = { [key: string]: any };
export type Updater<M> = (model: M, message?: GenericObject, relay?: GenericObject) => UpdateResult<M>;

export type DelegateDef = symbol | string;
export type UpdateMapDef<M> = [MessageConstructor, Updater<M>][];
export type UpdateMap<M> = Map<MessageConstructor, Updater<M>>;

export type ContainerDefPartial<M> = { update?: UpdateMapDef<M>, name?: string };
export type ContainerDefMapped<M> = { update: UpdateMap<M>, name: string };
export type ContainerPartial<M> = {
  delegate?: DelegateDef;
  init?: (model: M, relay: object) => UpdateResult<M>;
  relay?: { [key: string]: (model: object, relay: object) => object };
  view?: ContainerView;
  attach?: { store: object, key?: string }
};
export type ContainerDef<M> = ContainerDefPartial<M> & ContainerPartial<M>;

export type ContainerViewProps = GenericObject & { emit: any };
export type ContainerView = (props?: ContainerViewProps) => any;
export type Container<M> = ContainerView & ContainerPartial<M> & ContainerDefMapped<M> & {
  accepts: (m: MessageConstructor) => boolean,
  identity: () => ContainerDef<M>
};
export type IsolatedContainer<M> = Container<M> & { dispatch: any };

/**
 * Takes a value that may be an array or a Map, and converts it to a Map.
 */
const toMap = ifElse(is(Array), constructN(1, Map as any), id);

/**
 * Wraps a container's view to extract container-specific props and inject `emit()` helper
 * function into the view's props.
 *
 * @param  {Function} getContainer A function that returns the container
 * @param  {Function} emit An emit function bound to the container
 * @param  {String|Array} delegate The `delegate` value passed to the container
 * @param  {Function} register A registration function that allows the container to hook
 *                    itself into the component tree
 * @param  {Component} view The view passed to the container
 * @return {Function} Returns the wrapped container view
 */
const wrapView: <M>(defs: { env: Environment, container: Container<M> }) => any = ({ env, container }) => {
  /* eslint-disable react/prop-types */
  const mergeProps = pipe(defaultTo({}), omit(['delegate']));

  return (props: object & { delegate?: DelegateDef } = {}) => React.createElement(ViewWrapper, {
    childProps: mergeProps(props), container, delegate: props.delegate || container.delegate, env
  } as any);
};

/**
 * Maps default values of a container definition.
 */
const mapDef: <M>(def: ContainerDefPartial<M>) => ContainerDefMapped<M> = pipe(
  merge({ name: null, update: [] }),
  evolve({ update: toMap, name: defaultTo('UnknownContainer') })
);

/**
 * Creates a container bound to an execution environment
 *
 * @param  {Object} env The environment
 * @param  {Object} container The container definition
 * @return {Component} Returns a renderable React component
 */
export const withEnvironment = curry(<M>(env: Environment, def: ContainerDef<M>): Container<M> => {
  let ctr;
  const { freeze, assign, defineProperty } = Object;
  const fns = { identity: () => merge({}, def), accepts: msgType => ctr.update.has(msgType) };
  ctr = assign(mapDef(def), fns);
  return freeze(defineProperty(assign(wrapView({ env, container: ctr }), fns), 'name', { value: ctr.name }));
});

/**
 * Creates a new container.
 *
 * @param  {Object} An object with the following functions:
 *         - `init`: Returns an update result, representing the initial value of the container's model.
 *           See "Update Results" below for details.
 *         - `update`: A function that accepts the current model as an object,
 *            and returns a `Map` pairing message types to handler functions.
 *            Each handler function accepts the message's data as a parameter,
 *            returns an update result. See "Update Results" below for details.
 *         - `view`: A pure component (i.e. a function that returns React DOM) — as part of
 *           its props, the component will receive an `emit` function, which can be called
 *           with a user-defined message class.
 *         - `attach`: Optional. If attaching to a Redux store, pass `store` and (optionally) `key`. The
 *           container will then subscribe to the store and propagate changes. Remember to call `reducer()`
 *           on the container and pass the resulting value to `combineReducers()` to complete the loop.
 *
 * ### Update Results
 *
 * An update result is a value returned from dispatching a message. Update results are used
 * to update the containers's model, as well as return _command messages_, which represent
 * side-effects that the container can perform, such as an HTTP request.
 *
 * Update results can be one of the following:
 *
 * - An object: to update the model without performing any actions — at a minimum, the
 *   current model must always be returned
 * - An array of `[model, message]`: to update the model _and_ perform an action, return an array
 *   with the model first, and a message object second,
 *   i.e. `[model, new Alert({ message: "Hello world!" })]`
 * - An array of `[model, [message]]`: to perform multiple actions, simply return an array of
 *   command messages
 *
 * @return {Object} returns an object with the following methods:
 *
 *  - `dispatch`: Accepts a message object to update the container's model
 *  - `state`: Returns the current model
 *  - `view`: A React wrapper component that can be rendered or embedded
 *    in another component
 *  - `reducer`: Returns a Redux-compatible reducer function. Optionally accepts a hash
 *    pairing action types to message types, to enable the container to respond to Redux actions,
 *    which will be mapped to messages.
 *  - `push`: Accepts a new model value to update the container.
 *  - `subscribe`: Accepts a callback which receives a copy of the model when it is updated.
 *  - `identity`: Returns an object containing the original values that created this container.
 *  - `accepts`: Accepts a message class and returns a boolean indicating whether the container
 *    accepts messages of that type.
 */
export const container: <M>(def: ContainerDef<M>) => Container<M> = withEnvironment(defaultEnv);

/**
 * Returns a copy of a container, disconnected from its effects / command dispatcher.
 * Calling `dispatch()` on the container will simply return any commands issued.
 */
export const isolate = <M>(ctr: Container<M>, opts: any = {}): IsolatedContainer<M> => {
  const stateManager = opts.stateManager && always(opts.stateManager) || (() => new StateManager());
  const env = environment({ dispatcher: nthArg(2), effects: new Map([]), log: () => {}, stateManager });

  const container = Object.assign(mapDef(ctr.identity()), { accepts: always(true) }) as Container<M>;
  const parent: any = opts.relay ? { relay: always(opts.relay) } : null;
  const execContext = new ExecContext({ env, parent, container, delegate: null });

  return Object.assign(wrapView({ env, container }), pick(['dispatch', 'push', 'state'], execContext));
};

/**
 * Helper function for sequencing multiple updaters together using left-to-right composition.
 * Each subsequent updater will receive the model returned by the preceding updater, and command messages
 * returned will be aggregated across all updaters. If any updater returns a function, that function
 * will be treated as an updater.
 */
export function seq<M>(...updaters: Updater<M>[]) {
  return function (model: M, message?: object, relay?: object): UpdateResult<M> {
    let newModel = model, commands = [], newCommands = [], updateResult = null;

    for (const updater of updaters) {
      updateResult = updater;

      while (is(Function, updateResult)) {
        updateResult = updateResult(newModel, message, relay);
      }
      [newModel, newCommands] = result(updateResult);
      commands = flatten(commands.concat(newCommands));
    }
    return [newModel, commands] as UpdateResult<M>;
  };
}

export type ModelMapperFn<M> = (model: M, message?: GenericObject, relay?: GenericObject) => M;
export type ModelMapper<M> = ModelMapperFn<M> | { [key: string]: ModelMapperFn<M> };

/**
 * Accepts a mapper that transforms a model. The mapper can be an updater, or an object that pairs
 * keys to updater-signature functions that return a value. The returned values are then paired to the
 * mapper's keys and merged into the model.
 */
export const mapModel = <M>(mapper: ModelMapper<M>) =>
  (model: M, message?: GenericObject, relay?: GenericObject): UpdateResult<M> => {
    const update = fn => fn(model, message, relay);
    return merge(model, is(Function, mapper) ? update(mapper) : map(update, mapper));
  };

export const relay = <M>(fn?: (r: any) => UpdateResult<M>) => pipe(nthArg(2), (fn || id));
export const message = <M>(fn?: (m: any) => UpdateResult<M>) => pipe(nthArg(1), (fn || id));
export const union = <M>(fn?: (u: { model: M, message?: any, relay?: any }) => UpdateResult<M>) =>
  (model: M, message = {}, relay = {}) => (fn || id)({ model, message, relay });

const mapData = (model, msg, relay) => ifElse(is(Function), fn => fn(model, msg, relay), id);
const consCommands = (model, msg, relay) => pipe(splitEvery(2), map(
  ([cmd, data]) => cmd && new (cmd as any)(mapData(model, msg, relay)(data)) || null
));

/**
 * Helper function for updaters that only issue commands. Pass in alternating command constructors and
 * command data, i.e.:
 *
 * ```
 * [FooMessage, commands(LocalStorage.Write, { key: 'foo' }, LocalStorage.Delete, { key: 'bar' })]
 * ```
 *
 * Command data arguments can also be functions that return data. These functions have the same type
 * signature as updaters:
 *
 * ```
 * [FooMessage, commands(Http.Post, (model, msg) => ({ url: '/foo', data: [model.someData, msg.otherData] }))]]
 * ```
 */
export const commands = <M>(...args: any[]): Updater<M> => {
  if (args.length % 2 !== 0) {
    throw new TypeError('commands() must be called with an equal number of command constructors & data parameters');
  }
  return (model, msg?, relay?) => [model, consCommands(model, msg, relay)(args)];
};
