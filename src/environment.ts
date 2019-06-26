import { always, cond, mergeDeepWithKey, path, pipe, prop, T } from 'ramda';
import { Container, Container3 } from './core';
import { default as coreDispatcher, handler } from './dispatcher';
import effects from './effects';
import Message, { MessageConstructor } from './message';
import ExecContext, { ExecContextPartial } from './runtime/exec_context';
import ExecContext3, { ExecContextPartial3 } from './runtime/exec_context3';
import StateManager from './runtime/state_manager';
import { ProcessState } from './subscription';
import { mergeMap } from './util';

export type Dispatcher = (...args: any[]) => any | void;
export type CommandDispatcher = (data: object, dispatch: Dispatcher) => any | void;
export type SubscriptionDispatcher = (processState: ProcessState, dispatch: Dispatcher) => any | void;

export type EnvDefPartial = {
  dispatcher: any;
  log?: (...args: any[]) => any | void;
  stateManager?: (container?: Container<any>) => StateManager;
};

export type EnvDefPartial3 = {
  dispatcher: any;
  log?: (...args: any[]) => any | void;
  stateManager?: (container?: Container3<any>) => StateManager;
};

export type EnvDef = EnvDefPartial & {
  effects: Map<MessageConstructor, CommandDispatcher | SubscriptionDispatcher>;
};

export type EnvDef3 = EnvDefPartial3 & {
  effects: Map<MessageConstructor, CommandDispatcher | SubscriptionDispatcher>;
};

export type Environment = EnvDefPartial & {
  handler: (msg: Message) => MessageConstructor;
  identity: () => EnvDef;
};

export type Environment3 = EnvDefPartial & {
  handler: (msg: Message) => MessageConstructor;
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
export const create = ({ effects, dispatcher = null, log = null, stateManager = null }: EnvDef): Environment => ({
  // tslint:disable:no-console
  dispatcher: (dispatcher || coreDispatcher)(effects),
  handler: handler(effects),
  identity: () => ({ effects, dispatcher, log, stateManager }),
  log: log || console.error.bind(console),
  stateManager: stateManager || (() => new StateManager())
});

export const root: Environment = create({ effects, dispatcher: coreDispatcher });

export const create3 = ({ effects, dispatcher = null, log = null, stateManager = null }: EnvDef3): Environment3 => ({
  // tslint:disable:no-console
  dispatcher: (dispatcher || coreDispatcher)(effects),
  handler: handler(effects),
  identity: () => ({ effects, dispatcher, log, stateManager }),
  log: log || console.error.bind(console),
  stateManager: stateManager || (() => new StateManager())
});

export const root3: Environment3 = create({ effects, dispatcher: coreDispatcher });

/**
 * Helper function for `create()`, to merge effects maps
 */
const mergeWithEffects = mergeDeepWithKey((key, left, right) => key === 'effects' ? mergeMap(left, right) : right);

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

const checkEnvChain3 = <M>(parent?: ExecContext3<M> | ExecContextPartial3, env?: Environment3): any => ({
  env,
  parent,
  canMerge: env && parent instanceof ExecContext3 && parent.env,
  hasOnlyParent: !env && parent instanceof ExecContext3 && parent.env,
  isOnlyChild: env && (!parent || !(parent instanceof ExecContext3) || !parent.env),
});

export const merge: <M>(parent?: ExecContext<M> | ExecContextPartial, env?: Environment) => Environment = pipe(
  checkEnvChain,
  cond([
    [prop('canMerge'), ({ parent, env }) => create(mergeWithEffects(parent.env.identity(), env.identity()))],
    [prop('hasOnlyParent'), path(['parent', 'env'])],
    [prop('isOnlyChild'), prop('env')],
    [T, always(root)]
  ])
);

export const merge3: <M>(parent?: ExecContext3<M> | ExecContextPartial3, env?: Environment3) => Environment3 = pipe(
    checkEnvChain3,
    cond([
      [prop('canMerge'), ({ parent, env }) => create(mergeWithEffects(parent.env.identity(), env.identity()))],
      [prop('hasOnlyParent'), path(['parent', 'env'])],
      [prop('isOnlyChild'), prop('env')],
      [T, always(root)]
    ])
);
