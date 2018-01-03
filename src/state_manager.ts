import { both, contains, defaultTo, flip, lensPath, nth, pipe, set, view, when } from 'ramda';
import { compareOffsets } from './util';

const inList = flip(contains);

export type Callback = (...args: any[]) => any;
export type Config = object & { path: string[] };

export default class StateManager {

  public state: object = {};
  public listeners: [any, Callback][] = [];

  constructor(state: object = {}) {
    Object.assign(this, { state });
  }

  /**
   * Gets the current state, optionally with a path into the root value.
   */
  public get(opts: Config = { path: [] }) {
    return view(lensPath(opts && opts.path || []))(this.state);
  }

  /**
   * Pushes a new state value to the state container. Optionally accepts a path into
   * the root value to write into.
   */
  public set(newState: object, opts: Config = { path: [] }) {
    this.state = set(lensPath(opts.path), newState, this.state);
    this.listeners.forEach(when(
      both(inList(this.listeners), pipe(nth(0), compareOffsets(opts.path))),
      this.broadcast
    ));
    return this.state;
  }

  /**
   * Attaches a subscriber function that is invoked when the state is updated. Optionally
   * accepts an array representing a path into the root state value that this listener
   * should observe changes on. Returns an unsubscribe function.
   */
  public subscribe(listener: Callback, opts: Config = { path: [] }): () => any {
    const config: [any, Callback] = [opts.path, listener];
    this.listeners.push(config);

    if (this.state) {
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
