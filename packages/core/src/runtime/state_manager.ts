import { both, contains, defaultTo, flip, lensPath, nth, pipe, set, view, when } from 'ramda';
import Message, { Constructor } from '../message';
import { EffectType, Process, ProcessState } from '../subscription';
import { compareOffsets } from '../util';
import ExecContext from './exec_context';

const inList = flip(contains);

export type Callback = (...args: any[]) => any;
export type Config = object & { path: (string | symbol)[] };
export type Context = ExecContext<any>;

export default class StateManager {

  public state: [object] = [{}];
  public listeners: [any, Callback][] = [];
  public processes: Map<Constructor<any, Message<any>>, Map<any, Process<any> | Process<any>[]>> = new Map();

  constructor(state: object = {}) {
    Object.assign(this, { state: [state] });
    Object.freeze(this);
  }

  /**
   * Gets the current state, optionally with a path into the root value.
   */
  public get(opts: Config = { path: [] }) {
    return view(lensPath(opts && opts.path || []))(this.state[0]);
  }

  /**
   * Pushes a new state value to the state container. Optionally accepts a path into
   * the root value to write into.
   */
  public set(newState: object, opts: Config = { path: [] }) {
    this.state[0] = set(lensPath(opts.path), newState, this.state[0]);
    this.listeners.forEach(when(
      both(inList(this.listeners), pipe(nth(0), compareOffsets(opts.path))),
      this.broadcast
    ));
    return this.state[0];
  }

  /**
   * Updates the subscriptions attached to the container.
   */
  public run(context: Context, subs: Map<any, any>, dispatch: any, config: any = {}) {
    subs.forEach((data, key) => dispatch(new ProcessState({
      ...config,
      [EffectType]: key,
      context,
      data,
      current: this.processes.get(key) || null,
      set: procState => this.processes.set(key, procState)
    })));
  }

  public stop(context: Context, subs: Map<any, any>, dispatch: any, config: any = {}) {
    this.run(context, subs, dispatch, { ...config, state: ProcessState.STOPPED });
  }

  /**
   * Attaches a subscriber function that is invoked when the state is updated. Optionally
   * accepts an array representing a path into the root state value that this listener
   * should observe changes on. Returns an unsubscribe function.
   */
  public subscribe(listener: Callback, opts: Config = { path: [] }): () => any {
    const config: [any, Callback] = [opts.path, listener];
    this.listeners.push(config);

    if (this.state[0]) {
      this.broadcast(config);
    }
    return this.unsubscribeFn(config);
  }

  protected broadcast = ([path, listener]) => listener(defaultTo({}, this.get({ path })));

  /**
   * Returns an unsubscribe function for a listener.
   */
  protected unsubscribeFn(listener: [any, Callback]) {
    return () => {
      const index = this.listeners.indexOf(listener);
      return index > -1 && this.listeners.splice(index, 1)[0] || false;
    };
  }
}
