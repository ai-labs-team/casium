import {
  always, constructN, curry, defaultTo, evolve, flatten, identity as id,
  ifElse, is, map, merge, nthArg, omit, pick, pipe, splitEvery
} from 'ramda';

import { create, Environment } from './environment';
import Message, { MessageConstructor } from './message';
import ExecContext from './runtime/exec_context';
import StateManager from './runtime/state_manager';
import { mapResult, reduceUpdater } from './util';

/**
 *  A global symbol that allows users to opt into what is currently the default delegate behavior
 *  i.e when a delegate is unspecified, the container is hoisted into it's parent state
 */
export const PARENT = Symbol.for('@delegate/parent');

export type Empty = false | null | undefined;
export type MessageOrEmpty = Message | Empty;
export type GenericObject = { [key: string]: any };

export type UpdateResult<M> = M | ((model: M) => M) | [M, ...MessageOrEmpty[]] | [M, MessageOrEmpty[]];

export type Updater<M> = (model: M, message?: GenericObject, relay?: GenericObject) => UpdateResult<M>;
export type UpdaterDef<M> = (model: M, message: GenericObject, relay: GenericObject) => UpdateResult<M>;

export type DelegateDef = symbol | string;
export type UpdateMapDef<M> = [MessageConstructor, UpdaterDef<M>][];
export type UpdateMap<M> = Map<MessageConstructor, UpdaterDef<M>>;

export type ContainerDefPartial<M> = { update?: UpdateMapDef<M>, name?: string };
export type ContainerDefMapped<M> = { update: UpdateMap<M>, name: string };
export type ContainerPartial<M> = {
  delegate?: DelegateDef;
  init?: (model: M, relay: GenericObject) => UpdateResult<M>;
  relay?: { [key: string]: (model: M, relay: GenericObject) => M & GenericObject };
  view?: ContainerViewDef<M>;
  attach?: { store: GenericObject, key?: string };
  subscriptions?: (model: M, relay: GenericObject) => any | any[];
};
export type ContainerDef<M> = ContainerDefPartial<M> & ContainerPartial<M>;

export type Emitter = (msg: MessageConstructor | [MessageConstructor, GenericObject]) => any;
export type ContainerViewProps<M> = M & { emit: Emitter, relay: GenericObject };
export type ContainerViewDef<M> = (props: ContainerViewProps<M>) => any;
export type ContainerView<M> = (props?: ContainerViewProps<M>) => any;
export type Container<M> = ContainerView<M> & ContainerPartial<M> & ContainerDefMapped<M> & {
  accepts: (m: MessageConstructor) => boolean;
  identity: () => ContainerDef<M>;
};
export type IsolatedContainer<M> = Container<M> & {
  dispatch: any;
  state: () => M;
  push: (state: M) => void;
};

const { freeze, assign, defineProperty } = Object;

/**
 * Takes a value that may be an array or a Map, and converts it to a Map.
 */
const toMap = ifElse(is(Array), constructN(1, Map as any), id);

type ViewWrapDef<M> = { env: Environment, container: Container<M> };
type Delegate = { delegate?: DelegateDef };
type ViewProps<M> = Partial<M> & Delegate;

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
const wrapView: <Model>(defs: ViewWrapDef<Model>) => any = ({ env, container }) => (
  <Model>(props: ViewProps<Model> = {}) => env.renderer({
    childProps: omit(['delegate'], props),
    container,
    delegate: props.delegate || container.delegate,
    env
  })
);

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
  const fns = { identity: () => merge({}, def), accepts: msgType => ctr.update.has(msgType) };
  ctr = assign(mapDef(def), fns);
  return freeze(defineProperty(assign(wrapView({ env, container: ctr }), fns), 'name', { value: ctr.name }));
});

/**
 * Returns a copy of a container, disconnected from its effects / command dispatcher.
 * Calling `dispatch()` on the container will simply return any commands issued.
 */
export const isolate = <M>(ctr: Container<M>, opts: any = {}): IsolatedContainer<M> => {
  const env = create({
    dispatcher: nthArg(2),
    effects: new Map(),
    log: () => {},
    stateManager: opts.stateManager && always(opts.stateManager) || (() => new StateManager()),
    renderer: opts.renderer,
  });
  const overrides = { accepts: opts.catchAll === false ? type => ctr.update && ctr.update.has(type) : always(true) };

  const container = assign(mapDef(ctr.identity()), overrides) as Container<M>;
  const parent: any = opts.relay ? { relay: always(opts.relay) } : null;
  const execContext = new ExecContext({ env, parent, container, delegate: null });

  return assign(wrapView({ env, container }), pick(['dispatch', 'push', 'state'], execContext));
};

/**
 * Helper function for sequencing multiple updaters together using left-to-right composition.
 * Each subsequent updater will receive the model returned by the preceding updater, and command messages
 * returned will be aggregated across all updaters. If any updater returns a function, that function
 * will be treated as an updater.
 */
export function seq<M>(...updaters: Updater<M>[]) {
  return function (model: M, msg: GenericObject = {}, relay: GenericObject = {}): UpdateResult<M> {
    const merge = ([{ }, cmds], [newModel, newCmds]) => [newModel, flatten(cmds.concat(newCmds))];
    const reduce = (prev, cur) =>
      merge(prev, mapResult(reduceUpdater(cur, prev[0], msg, relay)));

    return updaters.reduce(reduce, [model, []]) as UpdateResult<M>;
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
export const union = <M>(fn?: (u: { model: M, message?: GenericObject, relay?: GenericObject }) => UpdateResult<M>) =>
  (model: M, message = {}, relay = {}) => (fn || id)({ model, message, relay });

const mapData = (model, msg, relay) => ifElse(is(Function), fn => fn(model, msg, relay), id);
const consCommands = (model, msg, relay) => pipe(
  splitEvery(2),
  map(([cmd, data]) => cmd && new (cmd as any)(mapData(model, msg, relay)(data)) || null)
);

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
export type CommandParam<M> = MessageConstructor | Empty | GenericObject | UpdateCommandMapper<M>;
export type UpdateCommandMapper<M> = (model: M, message: GenericObject, relay: GenericObject) => GenericObject;
export const commands = <M>(...args: CommandParam<M>[]): Updater<M> => {
  if (args.length % 2 !== 0) {
    throw new TypeError('commands() must be called with an equal number of command constructors & data parameters');
  }
  return (model, msg?, relay?) => [model, consCommands(model, msg, relay)(args)];
};
