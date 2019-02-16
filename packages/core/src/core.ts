import { always, constructN, curry, evolve, identity, is, merge, nthArg, pick, pipe, when } from 'ramda';

import { create, Environment } from './environment';
import Message, { Command, Constructor } from './message';
import ExecContext from './runtime/exec_context';
import StateManager from './runtime/state_manager';

import {
  ContainerDef, ContainerView, Delegate, Emitter, ExternalInterface, GenericObject, InternalContainerDef
} from './internal/container';

export { Delegate, Emitter, GenericObject, PARENT } from './internal/container';

export type Container<Model> = ContainerView<Model> & ExternalInterface<Model>;

export type IsolatedContainer<Model> = ContainerView<Model> & {
  dispatch: <T>(msg: Message<T>) => Command<any>[] | Error;
  state: () => Model;
  push: (model: Model) => void;
};

type ViewWrapDef<Model> = {
  env: Environment;
  container: InternalContainerDef<Model> & ExternalInterface<Model>;
  execContext?: ExecContext<Model>;
};
type ChildViewProps<Model> = Model & { emit: Emitter, relay: GenericObject };
type ViewProps<Model> = ChildViewProps<Model> & { delegate?: Delegate };

const { freeze, assign, defineProperty } = Object;

/**
 * Takes a value that may be an array or a Map, and converts it to a Map.
 */
const toMap: <K, V>(list: [K, V][] | Map<K, V>) => Map<K, V> = when(is(Array), constructN(1, Map as any));

/**
 * Wraps a container's view to extract container-specific props and inject `emit()` helper
 * function into the view's props.
 */
const wrapView = <Model>({ env, container, execContext }: ViewWrapDef<Model>): React.SFC<ViewProps<Model>> => (
  ({ delegate, ...props }: ViewProps<Model>) => env.renderer({
    childProps: (props || {}) as ChildViewProps<Model>,
    container,
    delegate: delegate || container.delegate,
    execContext,
    env
  })
);

/**
 * Maps default values of a container definition.
 */
const mapDef: <Model>(def: Partial<ContainerDef<Model>>) => InternalContainerDef<Model> = pipe(
  merge({ name: 'UnknownContainer', init: identity, update: [], view: identity }),
  evolve({ update: toMap as any })
);

export interface WithEnvironment {
  (env: Environment): <Model>(def: ContainerDef<Model>) => Container<Model>;
  <Model>(env: Environment, def: ContainerDef<Model>): Container<Model>;
}

/**
 * Creates a container bound to an execution environment
 *
 * @param  env The environment
 * @param  container The container definition
 * @return Returns a renderable component based on the target environment (i.e. React, Vue, etc.)
 */
export const withEnvironment: WithEnvironment = curry(<Model>(
  env: Environment,
  def: ContainerDef<Model>
): Container<Model> => {
  let container: InternalContainerDef<Model> & ExternalInterface<Model>;

  const fns = {
    identity: () => merge({}, def),
    accepts: (msgType: Constructor<any, Message<any>>) => container.update.has(msgType)
  };

  container = mapDef(assign(def, fns)) as InternalContainerDef<Model> & ExternalInterface<Model>;
  return freeze(defineProperty(assign(wrapView({ env, container }), fns), 'name', { value: container.name }));
}) as WithEnvironment;

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
export const container: ContainerFactory = withEnvironment({} as any);

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
export const isolate = <Model>(ctr: Container<Model>, opts: IsolateOptions = {}): IsolatedContainer<Model> => {
  const stateManager = opts.stateManager && always(opts.stateManager) || (() => new StateManager());
  const env = create({
    dispatcher: nthArg(2),
    effects: new Map(),
    log: opts.log || (() => {}),
    stateManager,
    renderer: identity
  });
  const ctrDef = mapDef(ctr.identity());

  const overrides = {
    accepts: opts.catchAll === false
      ? (type: Constructor<any, Message<any>>) => ctrDef.update && ctrDef.update.has(type)
      : always(true)
  };

  const container = freeze(assign(ctrDef, overrides)) as typeof ctrDef & ExternalInterface<Model>;
  const parent = opts.relay ? { relay: always(opts.relay) } : null;
  const execContext = new ExecContext({ env, parent, container, delegate: null });

  return freeze(assign(
    wrapView({ env, container, execContext }),
    pick(['dispatch', 'push', 'state'], execContext)
  ));
};
