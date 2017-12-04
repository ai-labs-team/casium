import {
  always, complement as not, curry, defaultTo, filter, flatten, flip, identity, is, map,
  merge, mergeAll, mergeDeepWithKey, nth, pick, pickBy, pipe, prop, values
} from 'ramda';

import { Container, defaultLog, DelegateDef, Environment, environment, PARENT } from './app';
import { cmdName, intercept, notify } from './dev_tools';
import Message from './message';
import StateManager, { Callback, Config } from './state_manager';
import {
  constructMessage, isEmittable, mergeMap, result, safeStringify,
  suppressEvent, toEmittable, trap
} from './util';

const update = flip(merge);

export type ExecContextDef<M> = {
  env?: Environment,
  container: Container<M>,
  parent?: ExecContext<M>,
  delegate?: DelegateDef
};

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
 * Checks if a container or a container's ancestor handles messages of a given type
 *
 * @param  {Object} exec An instance of ExecContext
 * @param  {Function} msgType A message constructor
 * @return {Boolean} Returns true if the container (or an ancestor) has an update handler matching
 *         the given constructor, otherwise false.
 */
const handlesMsg = <M>(exec: ExecContext<M>) =>
  pipe(toEmittable, nth(0), walk((exec, type) => exec.container.accepts(type), exec));

/**
 * Formats a message for showing an error that occurred as the result of a command
 *
 * @param  {Message} msg
 * @param  {Message} cmd
 * @return {string}
 */
const formatError = (msg, cmd) => [
  `An error was thrown as the result of command ${(cmdName(cmd) || '{COMMAND UNDEFINED}')}`,
  `(${safeStringify(cmd && cmd.data)}), which was initiated by message`,
  (msg && msg.constructor && msg.constructor.name || '{INIT}'),
  `(${safeStringify(msg && msg.data)}) --`,
].join(' ');

const error = curry((logger, ctx, msg, err) => logger(formatError(msg, ctx), err) || err);

/**
 * Checks that a Message object is valid
 * @param  {Object} A ExecContext instance
 * @param {Object} A Message instance
 * @return {Object} Returns the message instance, otherwise throws an error if it is invalid
 */
const checkMessage = (exec, msg) => {
  const msgType = msg && msg.constructor;

  if (msgType === Function) {
    throw new TypeError(`Attempted to dispatch message constructor '${msg.name}' — should be an instance`);
  }
  if (!handlesMsg(exec)(msgType)) {
    throw new TypeError(`Unhandled message type '${msgType.name}' in container '${exec.container.name}'`);
  }
  return msg;
};

/**
 * Attaches a container's state manager to a Redux store to receive updates.
 *
 * @param  {Object} config The attachment configuration
 * @param  {Object} container The container
 * @return {Object} Returns the store's current state to use as the container's initial state
 */
const attachStore = (config, container) => {
  const getState = () => (config.key && prop(config.key) || identity)(config.store.getState());
  config.store.subscribe(pipe(getState, update(container.state()), container.push));
  return getState();
};

/**
 * Maps a state & a message to a new state and optional command (or list of commands).
 */
const mapMessage = (handler, state, msg, relay) => {
  if (!is(Message, msg)) {
    const ctor = msg && msg.constructor && msg.constructor.name || '{Unknown}';
    throw new TypeError(`Message of type '${ctor}' is not an instance of Message`);
  }
  if (!handler || !is(Function, handler)) {
    throw new TypeError(`Invalid handler for message type '${msg.constructor.name}'`);
  }
  return result(handler(state, msg.data, relay));
};

/**
 * Maps an Event object to a hash that will be wrapped in a Message.
 */
const mapEvent = curry((extra: object & { preventDefault?: boolean }, event: Event) => {
  const target = event.target as HTMLInputElement;
  const isDomEvent = event && (event as any).nativeEvent && is(Object, target);
  const isCheckbox = isDomEvent && target.type && target.type.toLowerCase() === 'checkbox';
  const value = isDomEvent && (isCheckbox ? target.checked : target.value);
  const eventVal = isDomEvent ? { value, ...pickBy(not(is(Object)), event) } : event;

  if (isDomEvent && !isCheckbox && extra.preventDefault !== false) {
    suppressEvent(event);
  }
  return mergeAll([{ event: always(event) }, eventVal, extra]);
});

/**
 * Checks that a command's response messages (i.e. `result`, `error`, etc.) are handled by a container.
 */
const checkCmdMsgs = curry(<M>(exec: ExecContext<M>, cmd: Message) => {
  const unhandled = pipe(prop('data'), values, filter(isEmittable), filter(not(handlesMsg(exec) as any)));
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

/**
 * Receives a Redux action and, if that action has been mapped to a container message constructor,
 * dispatches a message of the matching type to the container.
 *
 * @param  {Object} exec An executor bound to a container
 * @param  {Object} messageTypes An object that pairs one or more Redux action types to message
 *                  constructors
 * @param  {Object} action A Redux action
 */
const dispatchAction = (exec, messageTypes, action) => {
  if (action && action.type && messageTypes[action.type]) {
    exec.dispatch(new messageTypes[action.type](action));
  }
};

/**
 * Checks if an enviroment has been boud to a container, and if not returns a default
 * StateManager
 *
 * @param  {Object} container the container being bound to an ExecContext
 * @param  {Object} env the Environment bound to a container
 */
const configureStateManager = (container: Container<any>, env?: Environment): StateManager => {
  if (!env) {
    return intercept(new StateManager());
  }
  return intercept(env.stateManager(container));
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

  public stateMgr?: StateManager = null;
  public parent?: ExecContext<M> = null;
  public delegate?: DelegateDef = null;
  public path: string[] = [];
  public env?: Environment = null;
  public container?: Container<any> = null;

  protected errLog;
  protected getState: (params?: object) => object = null;

  constructor({ env, container, parent, delegate }: ExecContextDef<M>) {
    const stateMgr = parent && parent.state ? null : configureStateManager(container, env);
    const delegatePath = (delegate && delegate !== PARENT) ? delegate : [];
    const path = (parent && parent.path || []).concat(delegatePath as string[]);
    const { freeze, assign } = Object;
    let hasInitialized = false;

    const run = (msg, [next, cmds]) => {
      notify({ context: this, container, msg, path: this.path, prev: this.getState({ path: [] }), next, cmds });
      this.push(next);
      return this.env ? this.commands(msg, cmds) : true;
    };

    const initialize = fn => (...args) => {
      if (!hasInitialized && container.init) {
        hasInitialized = true;
        const { attach } = container, hasStore = attach && attach.store;
        const initial = hasStore ? attachStore(container.attach, container) : (this.getState() || {});
        run(null, result(container.init(initial, parent && parent.relay() || {}) || {}));
      }
      return fn.call(this, ...args);
    };

    const mergeContainerEnv = (parent?: ExecContext<M>, env?: Environment): Environment => {
      if (!env && (!parent || !parent.env)) {
        return null;
      }

      if (!env) {
        return parent.env;
      }

      if (!parent || !parent.env) {
        return env;
      }

      const mergeEffects = (k, l, r) => k === 'effects' ? mergeMap(l, r) : r;
      return environment(mergeDeepWithKey(mergeEffects, parent.env.identity(), env.identity()));
    };

    const containerEnv = mergeContainerEnv(parent, env);
    const wrapInit = (props: string[]) => pipe(pick(props), map(pipe(fn => fn.bind(this), initialize)));
    const errLog = containerEnv && error(containerEnv.log) || error(defaultLog);

    freeze(assign(this, {
      env: containerEnv,
      path,
      parent,
      errLog,
      delegate,
      stateMgr,
      container,
      getState: stateMgr ? stateMgr.get.bind(stateMgr) : config => parent.state(config || { path }),
      ...wrapInit(['dispatch', 'push', 'subscribe', 'state', 'relay'])(this.constructor.prototype),
    }));

    Object.assign(this.dispatch, { run });
  }

  public subscribe(listener: Callback, config?: Config) {
    return (this.stateMgr || this.parent).subscribe(listener, config || { path: this.path });
  }

  public dispatch(message: Message) {
    return trap(this.errLog(null), (msg) => {
      const msgType = msg.constructor, updater = this.container.update.get(msgType);
      const dispatch = (this.dispatch as any), { parent, getState, relay } = this;
      return updater ? dispatch.run(msg, mapMessage(updater, getState(), msg, relay())) : parent.dispatch(msg);
    })(checkMessage(this, message));
  }

  public commands(msg, cmds) {
    return pipe(flatten, filter(is(Object)), map(
      trap(this.errLog(msg), pipe(checkCmdMsgs(this), this.env.dispatcher(this.dispatch)))
    ))(cmds);
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

  public state(cfg?: object) {
    return this.getState(cfg);
  }

  /**
   * Converts a container's relay map definition to a function that return's the container's relay value.
   *
   * @param  {Object} The `name: () => value` relay map for a container
   * @param  {Object} The container to map
   * @return {Object} Converts the relay map to `name: value` by passing the state and parent relay values
   *         to each relay function.
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
    return (prev, action) => dispatchAction((this.dispatch as any).run, msgTypes, action) || this.getState();
  }

  /**
   * Returns a function that wraps a DOM event in a message and dispatches it to the attached container.
   */
  public emit(msgType) {
    const em = toEmittable(msgType), [type, extra] = em, ctr = this.container.name, name = type && type.name || '??';

    if (handlesMsg(this)(em)) {
      return pipe(defaultTo({}), mapEvent(extra), constructMessage(type), this.dispatch);
    }
    throw new Error(`Messages of type '${name}' are not handled by container '${ctr}' or any of its ancestors`);
  }
}
