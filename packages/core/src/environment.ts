import { always, cond, identity, mergeDeepWithKey, path, pipe, prop } from 'ramda';
import { Delegate, Emitter } from './core';
import { default as coreDispatcher, handler } from './dispatcher';
import { InternalContainerDef } from './internal/container';
import { Command, Constructor } from './message';
import ExecContext, { ExecContextPartial } from './runtime/exec_context';
import StateManager from './runtime/state_manager';
import { ProcessState } from './subscription';
import { mergeMap } from './util';

export type Dispatcher = (...args: any[]) => any | void;
export type CommandDispatcher = (data: object, dispatch: Dispatcher) => any | void;
export type SubscriptionDispatcher = (processState: ProcessState, dispatch: Dispatcher) => any | void;

export type EnvDefPartial = {
  dispatcher: Dispatcher;
  log?: (...args: any[]) => any | void;
  stateManager?: (container?: InternalContainerDef<any>) => StateManager;
  renderer: Renderer;
};

export type EnvDef = EnvDefPartial & {
  effects: Map<Constructor<any, Command<any>>, CommandDispatcher | SubscriptionDispatcher>;
};

export type RenderProps = {
  childProps: { [key: string]: any } & { emit: Emitter };
  container: InternalContainerDef<any>;
  delegate: Delegate;
  env: Environment;
};

export type Renderer = (props: RenderProps) => any;

export type Environment = EnvDefPartial & {
  handler: (msg: Command<any>) => Constructor<any, Command<any>>;
  identity: () => EnvDef;
};

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
export const create = ({
  effects,
  dispatcher = null,
  log = null,
  stateManager = null,
  renderer = identity
}: EnvDef): Environment => ({
  // tslint:disable:no-console
  dispatcher: (dispatcher || coreDispatcher)(effects),
  handler: handler(effects),
  identity: () => ({ effects, dispatcher, log, stateManager, renderer }),
  log: log || console.error.bind(console),
  stateManager: stateManager || (() => new StateManager()),
  renderer
});

/**
 * Helper function for `create()`, to merge effects maps
 */
const mergeWithEffects = mergeDeepWithKey<EnvDef, EnvDef>(
  (key, left, right) => key === 'effects' ? mergeMap(left, right) : right
);

/**
 * Helper function for `create()`. Validates state of environments.
 */
const checkEnvChain = <M>(parent?: ExecContext<M> | ExecContextPartial, env?: Environment): any => ({
  env,
  parent,
  canMerge: env && parent instanceof ExecContext && parent.env,
  hasOnlyParent: !env && parent instanceof ExecContext && parent.env,
  isOnlyChild: env && (!parent || !(parent instanceof ExecContext) || !parent.env),
});

export const merge: <M>(parent?: ExecContext<M> | ExecContextPartial, env?: Environment) => Environment = pipe(
  checkEnvChain,
  cond([
    [prop('canMerge'), ({ parent, env }: any) => create(mergeWithEffects(parent.env.identity(), env.identity()))],
    [prop('hasOnlyParent'), path(['parent', 'env'])],
    [prop('isOnlyChild'), prop('env')],
    [always(true), () => { throw new Error('@TODO: Something bad happened'); }]
  ])
) as any;
