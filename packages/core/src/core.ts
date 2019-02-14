import {
  always, constructN, curry, defaultTo, evolve, flatten, identity as id,
  is, map, merge, nthArg, omit, pick, pipe, splitEvery, when, identity
} from 'ramda';

import { create, Environment } from './environment'; 
import Message, { Command, Constructor } from './message';
import ExecContext from './runtime/exec_context';
import StateManager from './runtime/state_manager';
import { mapResult, reduceUpdater } from './util';

/**
 *  A global symbol that allows users to opt into what is currently the default delegate behavior
 *  i.e when a delegate is unspecified, the container is hoisted into it's parent state
 */
export const PARENT = Symbol.for('@delegate/parent');

export type Empty = false | null | undefined;
export type CommandOrEmpty = Command<any> | Empty;
export type GenericObject = { [key: string]: any };

export type Result<Model> = Model | [Model, ...CommandOrEmpty[]] | [Model, CommandOrEmpty[]];
export type BaseUpdater<Model, MsgData> = (model: Model, msg?: MsgData, relay?: GenericObject) => Result<Model>;
export type Updater<Model, MsgData> = (
  (BaseUpdater<Model, MsgData>) |
  ((model: Model, msg?: MsgData, relay?: GenericObject) => Updater<Model, MsgData>)
);

export type Delegate = symbol | string | DelegatePath;
export type DelegatePath = (string | symbol)[];
export type UpdaterPair<Model, MsgData> = [Constructor<MsgData, Message<MsgData>>, Updater<Model, MsgData>];
export type UpdateMap<Model, MsgData> = Map<Constructor<MsgData, Message<MsgData>>, Updater<Model, MsgData>>;

export type ContainerDefPartial<Model> = { update?: UpdaterPair<Model, any>[], name?: string };
export type ContainerDefMapped<Model> = { update: UpdateMap<Model, any>, name: string };
export type ContainerPartial<Model> = {
  delegate?: Delegate;
  init?: (model: Model, relay: GenericObject) => Result<Model>;
  relay?: { [key: string]: <RelayValue>(model: Model, relay: GenericObject) => RelayValue };
  view?: ContainerView<Model>;
  attach?: { store: GenericObject, key?: string };
  subscriptions?: (model: Model, relay: GenericObject) => CommandOrEmpty | CommandOrEmpty[];
};

export type ContainerDef<Model> = ContainerDefPartial<Model> & ContainerPartial<Model>;

export type Emitter = <MsgData>(
  msg: Constructor<MsgData, Message<MsgData>> | [Constructor<MsgData, Message<MsgData>>, Partial<MsgData>]
) => (e: any) => void;

export type ContainerView<Model> = (props?: Model & {
  emit: Emitter,
  relay: GenericObject
}) => any;

export type Container<Model> = (
  ContainerView<Model> & ContainerPartial<Model> & ContainerDefMapped<Model> & {
    accepts: <MsgData>(m: Constructor<MsgData, Message<MsgData>>) => boolean;
    identity: () => ContainerDef<Model>;
  }
);
export type IsolatedContainer<Model> = Container<Model> & {
  dispatch: any;
  state: () => Model;
  push: (model: Model) => void;
};

const { freeze, assign, defineProperty } = Object;

/**
 * Takes a value that may be an array or a Map, and converts it to a Map.
 */
const toMap: <K, V>(list: [K, V][] | Map<K, V>) => Map<K, V> = when(is(Array), constructN(1, Map));

type ViewWrapDef<Model> = { env: Environment, container: Container<Model> };
type ViewProps<Model> = Partial<Model> & { delegate?: Delegate };

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
const wrapView = <Model>({ env, container }: ViewWrapDef<Model>): React.SFC<ViewProps<Model>> => (
  (props: ViewProps<Model>) => env.renderer({
    childProps: omit(['delegate'], props || {}),
    container,
    delegate: props.delegate || container.delegate,
    env
  })
);

/**
 * Maps default values of a container definition.
 */
const mapDef: <Model>(def: ContainerDefPartial<Model>) => ContainerDefMapped<Model> = pipe(
  merge({ name: null, update: [] }),
  evolve({ update: toMap, name: defaultTo('UnknownContainer') })
) as any;

export interface WithEnvironment {
  (env: Environment): <Model>(def: ContainerDef<Model>) => Container<Model>;
  <Model>(env: Environment, def: ContainerDef<Model>): Container<Model>;
}

/**
 * Creates a container bound to an execution environment
 *
 * @param  {Object} env The environment
 * @param  {Object} container The container definition
 * @return {Component} Returns a renderable React component
 */
export const withEnvironment: WithEnvironment = curry(<Model>(
  env: Environment,
  def: ContainerDef<Model>
): Container<Model> => {
  let ctr: any;
  const fns = {
    identity: () => merge({}, def),
    accepts: (msgType: Constructor<any, Message<any>>) => ctr.update.has(msgType)
  };
  ctr = assign(mapDef(def), fns);
  return freeze(defineProperty(assign(wrapView({ env, container: ctr }), fns), 'name', { value: ctr.name }));
});

type ContainerFactory = <Model>(def: ContainerDef<Model>) => Container<Model>;

/**
 * Creates a new container.
 *
 * @param  An object with the following properties:
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
export const container: ContainerFactory = withEnvironment(root);

export type IsolateOptions = {
  stateManager?: StateManager;
  catchAll?: boolean;
  relay?: GenericObject;
  log?: (...args: any[]) => any;
};

/**
 * Returns a copy of a container, disconnected from its effects / command dispatcher.
 * Calling `dispatch()` on the container will simply return any commands issued.
 *
 * Useful for unit-testing containers.
 */
export const isolate = <Model>(
  ctr: Container<Model>,
  opts: IsolateOptions = {}
): IsolatedContainer<Model> => {
  const stateManager = opts.stateManager && always(opts.stateManager) || (() => new StateManager());
  const env = create({
    dispatcher: nthArg(2),
    effects: new Map(),
    log: opts.log || (() => {}),
    stateManager,
    renderer: identity
  });
  const overrides = { accepts: opts.catchAll === false ? type => ctr.update && ctr.update.has(type) : always(true) };

  const container = assign(mapDef(ctr.identity()), overrides) as Container<Model>;
  const parent = opts.relay ? { relay: always(opts.relay) } : null;
  const execContext = new ExecContext({ env, parent, container, delegate: null });

  return assign(wrapView({ env, container }), pick(['dispatch', 'push', 'state'], execContext));
};

/**
 * Helper function for sequencing multiple updaters together using left-to-right composition.
 * Each subsequent updater will receive the model returned by the preceding updater, and command messages
 * returned will be aggregated across all updaters.
 *
 * Improves container refactoring by allowing you to extract and recompose shared logic.
 */
export function seq<Model, MsgData>(...updaters: Updater<Model, MsgData>[]) {
  return function (model: Model, msg: MsgData, relay: GenericObject = {}): Updater<Model, MsgData> {
    const merge = ([{ }, cmds], [newModel, newCmds]) => [newModel, flatten(cmds.concat(newCmds))];
    const reduce = (prev, cur) => merge(prev, mapResult(reduceUpdater(cur, prev[0], msg, relay)));

    return updaters.reduce(reduce, [model, []]) as Updater<Model, MsgData>;
  };
}

export type ModelMapperFn<Model, MsgData, R> = (model: Model, msg?: MsgData, relay?: GenericObject) => R;

export type ModelMapper<Model, MsgData> = (ModelMapperFn<Model, MsgData, Model> | {
  [K in keyof Model]: ModelMapperFn<Model, MsgData, Model[K]>
});

/**
 * Accepts a mapper that transforms a model. The mapper can be an updater, or an object that pairs
 * keys to updater-signature functions that return a value. The returned values are then paired to the
 * mapper's keys and merged into the model.
 */
export const mapModel = <Model, MsgData>(mapper: ModelMapper<Model, MsgData>) => (
  model: MsgData,
  msg?: MsgData,
  relay?: GenericObject
): Updater<Model, MsgData> => {
  const update = fn => fn(model, msg, relay);
  return merge(model, is(Function, mapper) ? update(mapper) : map(update, mapper));
};

export const relay = <Model, MsgData>(fn?: (r: GenericObject) => Updater<Model, MsgData>) => pipe(
  nthArg(2), (fn || id)
);
export const message = <Model, MsgData>(fn?: (m: MsgData) => Updater<Model, MsgData>) => pipe(nthArg(1), (fn || id));
export const union = <Model, MsgData>(
  fn?: (u: { model: Model, msg?: MsgData, relay?: GenericObject }) => Updater<Model, MsgData>
) => (model: Model, msg = {}, relay = {}) => (fn || id)({ model, msg, relay });

const mapData = (model, msg, relay) => when(is(Function), fn => fn(model, msg, relay));
const consCommands = <Model>(model: Model, msg: GenericObject, relay: GenericObject) => pipe(
  splitEvery(2),
  map(([cmd, data]: any) => cmd && new (cmd as any)(mapData(model, msg, relay)(data)) || null)
);

export type CommandParam<Model, MsgData, CmdData> = (
  Constructor<any, Command<any>> | Empty | GenericObject | UpdateCommandMapper<Model, MsgData, CmdData>
);
export type UpdateCommandMapper<Model, MsgData, CmdData> = (
  model: Model,
  msg: MsgData,
  relay: GenericObject
) => CmdData;

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
 *
 * @deprecated
 */
export const commands = <Model extends {}, MsgData extends {}>(
  ...args: CommandParam<Model, MsgData, any>[]
): Updater<Model, MsgData> => {
  if (args.length % 2 !== 0) {
    throw new TypeError('commands() must be called with an equal number of command constructors & data parameters');
  }
  return (model, msg?, relay?) => [model, consCommands(model, msg, relay)(args)];
};

/**
 * Helper function for updaters that issue commands. Pass in a command constructor and
 * command data, i.e.:
 *
 * ```
 * [FooMessage, command(LocalStorage.Write, { key: 'foo' })]
 * ```
 *
 * Command data arguments can also be functions that return data. These functions have the same type
 * signature as updaters:
 *
 * ```
 * [FooMessage, command(Http.Post, (model, msg) => ({ url: '/foo', data: [model.someData, msg.otherData] }))]]
 * ```
 *
 * To sequence multiple commands together, use the `seq()` helper function:
 *
 * ```
 * [FooMessage, seq(
 *   command(LocalStorage.Write, { key: 'foo' }),
 *   command(LocalStorage.Delete, { key: 'bar' })
 * )]
 * ```
 */
export const command = <Model, MsgData, CmdData>(
  cmd: Constructor<CmdData, Command<CmdData>> | Empty,
  data: CmdData | UpdateCommandMapper<Model, MsgData, CmdData>
) => (
  (model: Model, msg?: MsgData, relay?: GenericObject) => [model, cmd && new cmd(mapData(model, msg, relay)(data))]
);
