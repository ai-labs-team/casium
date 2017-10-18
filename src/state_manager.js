import { pipe, nth, lensPath, view, set, defaultTo, flip, contains, when, both } from 'ramda';
import { compareOffsets } from './util';

const inList = flip(contains);

export default class StateManager {

  constructor(state = {}) {
    Object.assign(this, {
      state,
      listeners: [],
      _broadcast: ([path, listener]) => listener(defaultTo({}, this.get({ path }))),
    });
  }

  /**
   * Gets the current state, optionally with a path into the root value.
   */
  get(opts = { path: [] }) {
    return view(lensPath(opts && opts.path || []))(this.state);
  }

  /**
   * Pushes a new state value to the state container. Optionally accepts a path into
   * the root value to write into.
   */
  set(newState, opts = { path: [] }) {
    this.state = set(lensPath(opts.path), newState, this.state);
    this.listeners.forEach(when(
      both(inList(this.listeners), pipe(nth(0), compareOffsets(opts.path))),
      this._broadcast
    ));
    return this.state;
  }

  /**
   * Attaches a subscriber function that is invoked when the state is updated. Optionally
   * accepts an array representing a path into the root state value that this listener
   * should observe changes on. Returns an unsubscribe function.
   */
  subscribe(listener, opts = { path: [] }) {
    const config = [opts.path, listener];
    this.listeners.push(config);

    if (this.state) {
      this._broadcast(config);
    }
    return this.unsubscribeFn(config);
  }

  /**
   * Returns an unsubscribe function for a listener.
   */
  unsubscribeFn(listener) {
    return () => {
      const index = this.listeners.indexOf(listener);
      return index > -1 && this.listeners.splice(index, 1)[0] || false;
    };
  }
}
