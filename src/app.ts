import {
  always, constructN, curry, defaultTo, evolve, identity, ifElse, is, map, merge, nthArg, omit, pick, pipe, splitEvery
} from 'ramda';

import * as React from 'react';

import effects from './effects';
import dispatcher from './effects/dispatcher';
import ExecContext from './exec_context';
import Message from './message';
import StateManager from './state_manager';
import ViewWrapper from './view_wrapper';

/**
 *  A global symbol that allows users to opt into what is currently the default delegate behavior
 *  i.e when a delegate is unspecified, the container is hoisted into it's parent state
 */
export const PARENT = Symbol.for('@delegate/parent');

interface MessageConstructor {
  new(): Message;
}

type MessageOrEmpty = Message | false | null | undefined;

type UpdateResult = object |
  [object] |
  [object, MessageOrEmpty] |
  [object, MessageOrEmpty, MessageOrEmpty] |
  [object, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty] |
  [object, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty] |
  [object, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty] |
  [
    object, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty,
    MessageOrEmpty, MessageOrEmpty
  ] |
  [
    object, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty,
    MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty
  ] |
  [
    object, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty,
    MessageOrEmpty, MessageOrEmpty, MessageOrEmpty, MessageOrEmpty
  ];

type Updater = (...args: any[]) => UpdateResult;

type EnvDef = {
  dispatcher: any;
  effects: UpdateMap;
  log?: (...args: any[]) => any | void;
  stateManager?: () => StateManager
};

export type DelegateDef = symbol | string;
type UpdateMapDef = [MessageConstructor, Updater][];
type UpdateMap = Map<MessageConstructor, Updater>;

type ContainerDefPartial = { update?: UpdateMapDef, name?: string };
type ContainerDef = ContainerDefPartial & {
  delegate: DelegateDef;
  init?: (...args: any[]) => UpdateResult;
  relay?: { [key: string]: (model: object, relay: object) => object };
  view: (props: object) => any;
  attach?: { store: object, key?: string }
};

export type Container = any;
export type Environment = any;

/**
 * Takes a value that may be an array or a Map, and converts it to a Map.
 */
const toMap = ifElse(is(Array), constructN(1, Map as any), identity);

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
const wrapView = ({ env, container }: { env: Environment, container: Container }) => {
  /* eslint-disable react/prop-types */
  const mergeProps = pipe(defaultTo({}), omit(['delegate']));

  return (props: object & { delegate?: DelegateDef } = {}) => React.createElement(ViewWrapper, {
    childProps: mergeProps(props), container, delegate: props.delegate || container.delegate, env
  } as any);
};

/**
 * Maps default values of a container definition.
 */
const mapDef: (def: ContainerDefPartial) => { update: UpdateMap, name: string } = pipe(
  merge({ name: null, update: [] }),
  evolve({ update: toMap, name: defaultTo('UnknownContainer') })
);

/**
 * Creates an execution environment for a container by providing it with a set of effects
 * handlers and an effect dispatcher.
 *
 * @param  {Map} effects A map pairing message classes to handler functions for that
 *               message type.
 * @param  {Function} dispatcher A message dispatcher function that accepts an effect
 *               map, a container message dispatcher (i.e. the update loop), and a message to
 *               dispatch. Should be a curried function.
 * @param  {Function} stateManager A function that returns a new instance of `StateManager`.
 * @return {Object} Returns an environment object with the following functions:
 *         - dispatcher: A curried function that accepts a container-bound message dispatcher
 *           and a command message
 *         - stateManager: A StateManager factory function
 *         - identity: Returns the parameters that created this environment
 */
export const environment = ({ effects, dispatcher, log = null, stateManager = null }: EnvDef): Environment => ({
  dispatcher: dispatcher(effects),
  identity: () => ({ effects, dispatcher, log, stateManager }),
  log: log || console.error.bind(console),
  stateManager: stateManager || (() => new StateManager())
});

/**
 * Creates a container bound to an execution environment
 *
 * @param  {Object} env The environment
 * @param  {Object} container The container definition
 * @return {Component} Returns a renderable React component
 */
export const withEnvironment = curry((env: EnvDef, containerDef: ContainerDef): Container => {
  let container;
  const { freeze, assign, defineProperty } = Object;
  const fns = { identity: () => merge({}, containerDef), accepts: msgType => container.update.has(msgType) };
  container = assign(mapDef(containerDef), fns);
  return freeze(defineProperty(assign(wrapView({ env, container }), fns), 'name', { value: container.name }));
});

const defaultEnv = environment({ effects, dispatcher });

/**
 * Creates a new container.
 *
 * @param  {Object} An object with the following functions:
 *         - `init`: Returns an update result, representing the initial value of the container's state.
 *           See "Update Results" below for details.
 *         - `update`: A function that accepts the current state as an object,
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
 * to update the containers's state, as well as return _command messages_, which represent
 * side-effects that the container can perform, such as an HTTP request.
 *
 * Update results can be one of the following:
 *
 * - An object: to update the state without performing any actions — at a minimum, the
 *   current state must always be returned
 * - An array of `[state, message]`: to update the state _and_ perform an action, return an array
 *   with the state first, and a message object second,
 *   i.e. `[state, new Alert({ message: "Hello world!" })]`
 * - An array of `[state, [message]]`: to perform multiple actions, simply return an array of
 *   command messages
 *
 * @return {Object} returns an object with the following methods:
 *
 *  - `dispatch`: Accepts a message object to update the container's state
 *  - `state`: Returns the current state
 *  - `view`: A React wrapper component that can be rendered or embedded
 *    in another component
 *  - `reducer`: Returns a Redux-compatible reducer function. Optionally accepts a hash
 *    pairing action types to message types, to enable the container to respond to Redux actions,
 *    which will be mapped to messages.
 *  - `push`: Accepts a new state value to update the container.
 *  - `subscribe`: Accepts a callback which receives a copy of the state when it is updated.
 *  - `identity`: Returns an object containing the original values that created this container.
 *  - `accepts`: Accepts a message class and returns a boolean indicating whether the container
 *    accepts messages of that type.
 */
export const container = withEnvironment(defaultEnv);

/**
 * Returns a copy of a container, disconnected from its effects / command dispatcher.
 * Calling `dispatch()` on the container will simply return any commands issued.
 */
export const isolate = (ctr: Container, opts: any = {}) => {
  const stateManager = opts.stateManager && always(opts.stateManager) || (() => new StateManager());
  const env = environment({ dispatcher: nthArg(2), effects: new Map([]), log: () => {}, stateManager });

  const container = Object.assign(mapDef(ctr.identity()), { accepts: always(true) });
  const parent: any = opts.relay ? { relay: always(opts.relay) } : null;
  const execContext = new ExecContext({ env, parent, container, delegate: null });

  return Object.assign(wrapView({ env, container }), pick(['dispatch', 'push', 'state'], execContext));
};

const mapData = (model, msg, relay) => ifElse(is(Function), fn => fn(model, msg, relay), identity);
const consCommands = (model, msg, relay) => pipe(splitEvery(2), map(
  ([cmd, data]) => new (cmd as any)(mapData(model, msg, relay)(data))
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
export const commands = (...args: any[]) => {
  if (args.length % 2 !== 0) {
    throw new TypeError('commands() must be called with an equal number of command constructors & data parameters');
  }
  return (model, msg?, relay?) => [model, consCommands(model, msg, relay)(args)];
};
