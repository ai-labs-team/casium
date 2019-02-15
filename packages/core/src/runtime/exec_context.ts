import {
  complement as not, concat, curry, defaultTo, equals, filter, flatten, is, isEmpty, keys, map, merge, pick, pipe, tap
} from 'ramda';

import * as Environment from '../environment';
import { intercept, notify } from '../instrumentation';
import {
  cmdName, Delegate, ExternalInterface,
  GenericObject, InternalContainerDef, mapResult, msgName, PARENT, reduceUpdater
} from '../internal/container';
import Message, { Command, Constructor, Emittable } from '../message';
import { toArray, trap } from '../util';
import StateManager, { Callback, Config, Path } from './state_manager';

import * as Redux from './redux';
import * as Validator from './validator';

export type ExecContextPartial = { relay: () => object, state?: (cfg?: object) => object, path?: string[] };

export type ExecContextDef<Model> = {
  env?: Environment.Environment,
  container: InternalContainerDef<Model>,
  parent?: ExecContext<Model> | ExecContextPartial,
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
const logMsgError = curry((logger: typeof console.log, err: Error, msg: Message<any>) => {
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
const logCmdError = curry((logger: typeof console.log, msg: Message<any>, err: Error, cmd: Command<any>) => {
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
 * Groups subscriptions by the effect handler constructor.
 */
const groupEffects = <T, U>(keyFn: (val: T) => U) => (prev: Map<U, T[]>, current: T) => {
  const key = keyFn(current);
  prev.set(key, (prev.get(key) || []).concat([current]));
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
  public path: Path = [];
  public env?: Environment.Environment = null;
  public container?: InternalContainerDef<Model> & ExternalInterface<Model> = null;

  protected getState: (cfg?: Config) => object = null;
  protected stateMgr?: StateManager = null;

  constructor({ env, container, parent, delegate }: ExecContextDef<Model>) {
    const ctrEnv = Environment.merge(parent, env);
    const path = concat(parent && parent.path || [], (delegate && delegate !== PARENT) ? toArray(delegate) : []);
    let hasInitialized = false;

    const run = <T>(msg: Message<T>, [next, cmds]: [Model, Command<any>[]]) => {
      const stateMgr = this.stateManager(), subs = this.subscriptions(next);
      notify({ context: this, container, msg, path: this.path, prev: this.getState({ path: [] }), next, cmds, subs });
      this.push(next);
      stateMgr.run(this, subs, this.commandDispatcher());
      return this.commands(msg, cmds);
    };

    const initialize = (fn: Callback) => (...args: any[]) => {
      if (!hasInitialized) {
        hasInitialized = true;
        const { attach } = container, hasStore = attach && attach.store;
        const initial: Model = (hasStore ? Redux.attachStore(container.attach, this) : (this.getState() || {}));
        run(null, mapResult(container.init(initial, parent && parent.relay() || {}) || {}));
      }
      return fn.call(this, ...args);
    };

    const wrapInit = (props: string[]) => pipe(pick(props), map(pipe((fn: Callback) => fn.bind(this), initialize)));
    const isRoot: boolean = !parent || ExecContext.isPartial(parent);
    const stateMgr: StateManager = isRoot ? intercept(ctrEnv.stateManager(container)) : null;
    const getState = stateMgr ? stateMgr.get.bind(stateMgr) : (config: Config) => parent.state(config || { path });

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
  public dispatch<T>(msg: Message<T>): Error | Command<any>[] {
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

  public commands<T>(msg: Message<T>, cmds: Command<any>[]) {
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

  public push(val: Model, config?: object & { path: any[] }): object {
    if (!this.stateMgr && !this.delegate && this.getState() as any as Model !== val) {
      throw new Error(`'${this.container.name}' is trying to modify the state, `
        + 'but has no \'delegate\' specified. Either opt into parent modification by '
        + `giving '${this.container.name}' the delegate of the PARENT Symbol, or `
        + `not have '${this.container.name}' modify the state.`);
    }
    return this.stateMgr ? this.stateMgr.set(val as any, config) : this.parent.push(val, config || { path: this.path });
  }

  public state(cfg?: Config): Model {
    return this.getState(cfg) as any as Model;
  }

  /**
   * Returns the container's relay value, based on the state of the current model.
   */
  public relay(): GenericObject {
    const { parent, container } = this, inherited = parent && parent.relay() || {};
    return merge(inherited, map(fn => fn(this.state() as any as Model, inherited), container.relay || {}));
  }

  /**
   * Returns a Redux-compatible reducer, which optionally accepts a map of action types to message constructors
   * which the container should handle.
   */
  public reducer<Data, Name extends string>(msgTypes: Redux.MessageMap<Redux.Action<Data, Name>> = {}) {
    return ({}, action: Redux.Action<Data, Name>) => {
      Redux.dispatchAction((this.dispatch as any).run, msgTypes, action);
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
