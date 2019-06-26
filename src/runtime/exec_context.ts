import {
  complement as not, concat, curry, defaultTo, filter, flatten,
  identity, is, isEmpty, map, nth, pick, pipe, prop, values
} from 'ramda';

import { Container } from '../core';
import * as Environment from '../environment';
import { intercept, notify } from '../instrumentation';
import Message, { MessageConstructor } from '../message';
import { cmdName, mapResult, msgName, reduceUpdater3, replace, toArray, trap } from '../util';
import StateManager, { Callback, Config } from './state_manager';

export type ExecContextPartial = { state?: (cfg?: object) => object, path?: string[] };

export type ExecContextDef<M> = {
  env?: Environment.Environment,
  container: Container<M>,
  parent?: ExecContext<M> | ExecContextPartial,
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
 * Walk up a container hierarchy looking for a value.
 *
 * @param  {Function} Callback to check an execution context for a value
 * @param  {Object} The starting (child) execution context to walk up from
 * @param  {*} args Arguments to pass to `cb`
 * @return {*}
 */
const walk = curry((cb, exec, val) => cb(exec, val) || exec.parent && walk(cb, exec.parent, val));

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

/**
 * Maps a state & a message to a new state and optional command (or list of commands).
 */
const mapMessage = (handler, state, msg) => {
  if (!is(Message, msg)) {
    const ctor = msg && msg.constructor && msg.constructor.name || '{Unknown}';
    throw new TypeError(`Message of type '${ctor}' is not an instance of Message`);
  }
  if (!handler || !is(Function, handler)) {
    throw new TypeError(`Invalid handler for message type '${msg.constructor.name}'`);
  }

  return mapResult(reduceUpdater3(handler, state, msg.data));
};

/**
 * Checks that a command's response messages (i.e. `result`, `error`, etc.) are handled by a container.
 */
const checkCmdMsgs = curry(<M>(exec: ExecContext<M>, cmd: Message) => {
  const unhandled = pipe(prop('data'), values, filter(Message.isEmittable), filter(not(exec.handles)));
  const msgs = unhandled(cmd);

  if (!msgs.length) {
    return cmd;
  }
  throw new Error([
    `A ${cmdName(cmd)} command was sent from container ${exec.container.name} `,
    'with one or more result messages that are unhandled by the container (or its ancestors): ',
    msgs.map(prop('name')).join(', '),
  ].join(''));
});

type ReduxAction = {
  type: string;
  [key: string]: any;
};

type ReduxMessageMap = {
  [key: string]: MessageConstructor;
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
const dispatchAction = <M>(exec: ExecContext<M>, messageTypes: ReduxMessageMap, action: ReduxAction) => {
  action && action.type && messageTypes[action.type] && exec.dispatch(new messageTypes[action.type](action));
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
export default class ExecContext<M> {

  public id: string = Math.round(Math.random() * Math.pow(2, 50)).toString();

  public parent?: ExecContext<M> = null;
  public path: (string | symbol)[] = [];
  public env?: Environment.Environment = null;
  public container?: Container<any> = null;

  protected errLog;
  protected getState: (params?: object) => object = null;
  protected stateMgr?: StateManager = null;

  constructor({ env, container, parent}: ExecContextDef<M>) {
    const ctrEnv = Environment.merge(parent, env);
    const path = concat(parent && parent.path || [], []);
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
        run(null, mapResult((container.init || identity)(initial, parent && parent.state || {}) || {}));
      }
      return fn.call(this, ...args);
    };

    const wrapInit = (props: string[]) => pipe(pick(props), map(pipe(fn => fn.bind(this), initialize)));
    const isRoot: boolean = !parent;
    const stateMgr: StateManager = isRoot ? intercept(ctrEnv.stateManager(container)) : null;
    const getState = stateMgr ? stateMgr.get.bind(stateMgr) : config => parent.state(config || { path });

    freeze(assign(this, {
      env: ctrEnv, path, parent, stateMgr, container, getState,
      ...wrapInit(['dispatch', 'push', 'subscribe', 'state'])(this.constructor.prototype),
    }));

    assign(this.dispatch, { run });
  }

  public subscribe(listener: Callback, config?: Config) {
    return this.stateManager().subscribe(listener, config || { path: this.path });
  }

  /**
   * Checks that a Message object is valid and is handled by the bound container, then dispatches it.
   */
  public dispatch(msg: Message) {
    const msgType = msg.constructor as MessageConstructor;

    if ((msgType as any) === Function) {
      throw new TypeError(`Attempted to dispatch message constructor '${(msg as any).name}' — should be an instance`);
    }
    if (!this.handles(msgType)) {
      throw new TypeError(`Unhandled message type '${msgType.name}' in container '${this.container.name}'`);
    }
    return trap(logMsgError(this.env.log), this.internalDispatch.bind(this))(msg);
  }

  public commands(msg, cmds) {
    return pipe(flatten, filter(is(Object)), map(
        trap(logCmdError(this.env.log, msg), pipe(checkCmdMsgs(this), this.commandDispatcher()))
    ))(cmds);
  }

  public commandDispatcher() {
    return this.env.dispatcher(this);
  }

  public push(val, config?: object & { path: any[] }) {
    if (!this.stateMgr && this.getState() !== val) {
      throw new Error(`TODO better error msg`);
    }
    return this.stateMgr ? this.stateMgr.set(val, config) : this.parent.push(val, config || { path: this.path });
  }

  public state(cfg?: object): object {
    return this.getState(cfg);
  }

  /**
   * Returns a Redux-compatible reducer, which optionally accepts a map of action types to message constructors
   * which the container should handle.
   *
   * @param  {Object} msgTypes
   */
  public reducer(msgTypes = {}) {
    return (prev, action) => {
      dispatchAction((this.dispatch as any).run, msgTypes, action);
      return this.getState();
    };
  }

  /**
   * Returns a function that wraps a DOM event in a message and dispatches it to the attached container.
   */
  public emit(msgType) {
    const em = Message.toEmittable(msgType),
        [type, extra] = em,
        ctr = this.container.name,
        name = type && type.name || '??';

    if (this.handles(em)) {
      return pipe(defaultTo({}), Message.mapEvent(extra), Message.construct(type), this.dispatch);
    }
    throw new Error(`Messages of type '${name}' are not handled by container '${ctr}' or any of its ancestors`);
  }

  /**
   * Called when the execution context shuts down. Clears attached subscription processes.
   */
  public destroy() {
    this.stateManager().stop(
        this,
        this.subscriptions(this.state() as any as M),
        this.commandDispatcher()
    );
  }

  /**
   * Checks if the container or container's ancestor handles messages of a given type
   *
   * @param  msgType A message constructor
   * @return Returns true if the container (or an ancestor) has an update handler matching
   *         the given constructor, otherwise false.
   */
  public get handles(): (msgType: MessageConstructor) => boolean {
    return pipe(Message.toEmittable, nth(0), walk((exec, type) => exec.container.accepts(type), this));
  }

  public stateManager(): StateManager {
    const parent = this.parent as ExecContext<M>;
    return this.stateMgr || parent.stateManager && parent.stateManager();
  }

  private subscriptions(model: M) {
    const { container, env } = this;
    return (
        !container.subscriptions && [] ||
        toArray(container.subscriptions(model))
    ).filter(not(isEmpty)).reduce(groupEffects(env.handler), new Map());
  }

  private internalDispatch(msg: Message) {
    const { dispatch, parent } = this, msgType = msg.constructor as MessageConstructor;
    const updater = this.container.update.get(msgType);
    return updater ? (dispatch as any).run(msg, mapMessage(updater, this.getState(), msg)) : parent.dispatch(msg);
  }
}
