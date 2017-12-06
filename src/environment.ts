import { mergeDeepWithKey } from 'ramda';
import { Container, GenericObject, UpdateMap } from './app';
import dispatcher from './dispatcher';
import effects from './effects';
import ExecContext, { ExecContextPartial } from './exec_context';
import StateManager from './state_manager';
import { mergeMap } from './util';

export type EnvDefPartial = {
  dispatcher: any;
  log?: (...args: any[]) => any | void;
  stateManager?: (container?: Container<GenericObject>) => StateManager;
};

export type EnvDef = EnvDefPartial & {
  effects: UpdateMap<GenericObject>;
};

export type Environment = EnvDefPartial & {
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
export const environment = ({ effects, dispatcher, log = null, stateManager = null }: EnvDef): Environment => ({
  dispatcher: dispatcher(effects),
  identity: () => ({ effects, dispatcher, log, stateManager }),
  log: log || console.error.bind(console),
  stateManager: stateManager || (() => new StateManager())
});

export const mergeEnv = <M>(
  parent?: ExecContext<M> | ExecContextPartial,
  env?: Environment): Environment => {
  if (env && parent instanceof ExecContext) {
    const mergeEffects = (k, l, r) => k === 'effects' ? mergeMap(l, r) : r;
    return environment(mergeDeepWithKey(mergeEffects, parent.env.identity(), env.identity()));
  } else if (!env && parent instanceof ExecContext) {
    return parent.env;
  } else if (env && !parent) {
    return env;
  }

  return defaultEnv;
};

export const defaultEnv: Environment = environment({ effects, dispatcher });
