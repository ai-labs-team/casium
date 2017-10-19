import { pipe, filter, nth, lensPath, view, set, forEach, defaultTo } from 'ramda';
import { compareOffsets } from './util';

/**
*
* StateManager adds and removes event listeners 
*
**/

export default class StateManager {
	constructor(state = {}) {
		Object.assign(this, { listeners: [], state });
	}

	get(opts = { path: [] }) {
		const path = opts && opts.path;
		return view(lensPath(path), this.state);
	}

	_listeners(path) {
		return filter(pipe(nth(0), compareOffsets(path)));
	}

	set(newState, opts = { path: [] }) {
		const broadcast = pipe(this._listeners(opts.path), forEach(this.broadcast.bind(this)));
		this.state = set(lensPath(opts.path), newState, this.state);
		broadcast(this.listeners);
		return this.state;
	}

	broadcast([path, listener]) {
		listener(defaultTo({}, this.get({ path })));
	}

	subscribe(listener, opts = { path: [] }) {
		const config = [opts.path, listener];
		this.listeners.push(config);

		if (this.state) {
			this.broadcast(config);
		}
		return this.unsubscribe(config);
	}

	unsubscribe(listener) {
		return () => {
			const index = this.listeners.indexOf(listener);
			return (index > -1 && this.listeners.splice(index, 1)[0]) || false;
		};
	}
}
