import {
  complement as not, concat, curry, defaultTo, equals, filter, flatten,
  identity, is, isEmpty, keys, map, merge, pick, pipe, prop, tap
} from 'ramda';

import { Container, Delegate, DelegatePath, PARENT } from '../core';
import * as Environment from '../environment';
import { intercept, notify } from '../instrumentation';
import Message, { Command, Constructor, Emittable } from '../message';
import { cmdName, mapResult, msgName, reduceUpdater, replace, toArray, trap } from '../util';
import StateManager, { Callback, Config } from './state_manager';

import * as Validator from './validator';

export type ExecContextPartial = { relay: () => object, state?: (cfg?: object) => object, path?: string[] };

export type ExecContextDef<M> = {
  env?: Environment.Environment,
  container: Container<M>,
  parent?: ExecContext<M> | ExecContextPartial,
  delegate?: Delegate
};

const { assign, freeze } = Object;

/**
 * Logs an Error that was thrown while handling a Message
 *
 * @param logger The function to use for logging to
 * @param err The Error that was thrown
 * @param msg The Message that resulted in the Error being thrown
 */
const logMsgError = curry((logger, err, msg) => {
  logger(`An error was thrown as the result of message '${msgName(msg)}' -- `, err);
  logger('Message: ', msg);

  return err;
});

/**
 * Logs an Error that was thrown while handling a Command that was initiated by
 * a Message.
 *
 * @param logger The function to use for logging to
 * @param msg The Message that initated the Command
 * @param err The Error that was thrown
 * @param msg The Command that resulted in the Error being thrown
 */
const logCmdError = curry((logger, msg, err, cmd) => {
  logger(
    `An error was thrown as the result of command '${cmdName(cmd)}', ` +
    `which was initiated by message '${msgName(msg)}' -- `,
    err
  );
  logger('Command: ', cmd);
  logger('Message: ', msg);

  return err;
});

/**
 * Attaches a container's state manager to a Redux store to receive updates.
 *
 * @param  {Object} config The attachment configuration
 * @param  {Object} container The container
 * @return {Object} Returns the store's current state to use as the container's initial state
 */
const attachStore = (config, ctx) => {
  const getState = () => (config.key && prop(config.key) || identity)(config.store.getState());
  config.store.subscribe(pipe(getState, replace(ctx.state()), ctx.push.bind(ctx)));
  return getState();
};

type ReduxAction<T> = T & {
  type: string;
};

type ReduxMessageMap<T> = {
  [key: string]: Constructor<T, Message<T>>;
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
const dispatchAction = <Model, T, Action extends ReduxAction<T>>(
  exec: ExecContext<Model>,
  msgTypes: ReduxMessageMap<T>,
  action: Action
) => {
  action && action.type && msgTypes[action.type] && exec.dispatch(new msgTypes[action.type](action));
};

/**
 * Groups subscriptions by the effect handler constructor.
 */
const groupEffects = keyFn => (prev, current) => {
  const key = keyFn(current);
  prev.set(key, concat(prev.get(key) || [], [current]));
  return prev;
};

/**
 * Binds together a container, environment, and a state manager to handles message execution within a
 * container.
 *
 * @param  {Function} getContainer A function that returns the container context to operate in
 * @param  {Map} updateMap A Map instance pairing message constructors to update handlers
 * @param  {Function} init An initialization function that executes the container's `init` function
 *                    with the initial state.
 * @return {Object} Returns an execution handler with the following functions:
 *         - initialize: A wrapper function used to delay the container's initial execution until its API
 *           is invoked
 *         - dispatch: Accepts a message to dispatch to the container
 */
export default class ExecContext<Model> {

  /**
   * Returns true if the passed context is a partial definition and not a full `ExecContext` instance.
   */
  public static isPartial: (ctx: ExecContext<any> | ExecContextPartial) => boolean = pipe(keys, equals(['relay']));

  public id: string = Math.round(Math.random() * Math.pow(2, 50)).toString();

  public parent?: ExecContext<Model> = null;
  public delegate?: Delegate = null;
  public path: (string | symbol)[] = [];
  public env?: Environment.Environment = null;
  public container?: Container<any> = null;

  protected errLog;
  protected getState: (params?: { path: DelegatePath }) => object = null;
  protected stateMgr?: StateManager = null;

  constructor({ env, container, parent, delegate }: ExecContextDef<Model>) {
    const ctrEnv = Environment.merge(parent, env);
    const path = concat(parent && parent.path || [], (delegate && delegate !== PARENT) ? toArray(delegate) : []);
    let hasInitialized = false;

    const run = (msg, [next, cmds]) => {
      const stateMgr = this.stateManager(), subs = this.subscriptions(next);
      notify({ context: this, container, msg, path: this.path, prev: this.getState({ path: [] }), next, cmds, subs });
      this.push(next);
      stateMgr.run(this, subs, this.commandDispatcher());
      return this.commands(msg, cmds);
    };

    const initialize = fn => (...args) => {
      if (!hasInitialized) {
        hasInitialized = true;
        const { attach } = container, hasStore = attach && attach.store;
        const initial = hasStore ? attachStore(container.attach, this) : (this.getState() || {});
        run(null, mapResult((container.init || identity)(initial, parent && parent.relay() || {}) || {}));
      }
      return fn.call(this, ...args);
    };

    const wrapInit = (props: string[]) => pipe(pick(props), map(pipe(fn => fn.bind(this), initialize)));
    const isRoot: boolean = !parent || ExecContext.isPartial(parent);
    const stateMgr: StateManager = isRoot ? intercept(ctrEnv.stateManager(container)) : null;
    const getState = stateMgr ? stateMgr.get.bind(stateMgr) : config => parent.state(config || { path });

    freeze(assign(this, {
      env: ctrEnv, path, parent, delegate, stateMgr, container, getState,
      ...wrapInit(['dispatch', 'push', 'subscribe', 'state', 'relay'])(this.constructor.prototype),
    }));

    assign(this.dispatch, { run });
  }

  public subscribe(listener: Callback, config?: Config) {
    return this.stateManager().subscribe(listener, config || { path: this.path });
  }

  /**
   * Checks that a Message object is valid and is handled by the bound container, then dispatches it.
   */
  public dispatch<T>(msg: Message<T>) {
    Validator.check('dispatch', { msg, exec: this });

    return trap(
      logMsgError(this.env.log),
      (msg: Message<T>) => {
        const { dispatch, parent, getState, relay } = this, msgType = msg.constructor as Constructor<T, Message<T>>;
        const updater = this.container.update.get(msgType);
        const model = getState();
        Validator.check('msg', { updater, msg });

        return updater
          ? (dispatch as any).run(msg, mapResult(reduceUpdater(updater, model, msg.data, relay())))
          : parent.dispatch(msg);
      }
    )(msg);
  }

  public commands(msg, cmds) {
    return pipe(flatten, filter(is(Object)), map(
      trap(
        logCmdError(this.env.log, msg),
        pipe(
          tap((cmd: Command<any>) => Validator.check('cmd', { exec: this, cmd })),
          this.commandDispatcher()
        )
      )
    ))(cmds);
  }

  public commandDispatcher() {
    return this.env.dispatcher(this);
  }

  public push(val, config?: object & { path: any[] }) {
    if (!this.stateMgr && !this.delegate && this.getState() !== val) {
      throw new Error(`'${this.container.name}' is trying to modify the state, `
        + 'but has no \'delegate\' specified. Either opt into parent modification by '
        + `giving '${this.container.name}' the delegate of the PARENT Symbol, or `
        + `not have '${this.container.name}' modify the state.`);
    }
    return this.stateMgr ? this.stateMgr.set(val, config) : this.parent.push(val, config || { path: this.path });
  }

  public state(cfg?: { path: DelegatePath }): object {
    return this.getState(cfg);
  }

  /**
   * Returns the container's relay value, based on the state of the current model.
   */
  public relay() {
    const { parent, container } = this, inherited = parent && parent.relay() || {};
    return merge(inherited, map(fn => fn(this.state(), inherited), container.relay || {}));
  }

  /**
   * Returns a Redux-compatible reducer, which optionally accepts a map of action types to message constructors
   * which the container should handle.
   *
   * @param  {Object} msgTypes
   */
  public reducer(msgTypes = {}) {
    return ({}, action) => {
      dispatchAction((this.dispatch as any).run, msgTypes, action);
      return this.getState();
    };
  }

  /**
   * Returns a function that wraps a DOM event in a message and dispatches it to the attached container.
   */
  public emit<T>(msgType: Emittable<T>) {
    const em = Message.toEmittable(msgType),
      [msgCtor, extra] = em;

    Validator.check('emit', { msgCtor, exec: this });
    return pipe(defaultTo({}), Message.mapEvent(extra), Message.construct(msgCtor), this.dispatch);
  }

  /**
   * Called when the execution context shuts down. Clears attached subscription processes.
   */
  public destroy() {
    this.stateManager().stop(
      this,
      this.subscriptions(this.state() as any as Model),
      this.commandDispatcher()
    );
  }

  public stateManager(): StateManager {
    const parent = this.parent as ExecContext<Model>;
    return this.stateMgr || parent.stateManager && parent.stateManager();
  }

  private subscriptions(model: Model) {
    const { container, env } = this;
    return (
      !container.subscriptions && [] ||
      toArray(container.subscriptions(model, this.relay()))
    ).filter(not(isEmpty)).reduce(groupEffects(env.handler), new Map());
  }
}
