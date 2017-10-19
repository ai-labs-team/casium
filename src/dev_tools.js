import { is, map, filter, pipe, lensPath, set, flatten } from 'ramda';
import { safeParse, safeStringify } from './util';
import * as commands from './commands';

const session =
	Date.now() +
	Math.random()
		.toString(36)
		.substr(2);
const send = msg => window.postMessage(msg, '*'),
	serialize = map(pipe(safeStringify, safeParse));

const _ARCH_DEV_TOOLS_STATE = (window._ARCH_DEV_TOOLS_STATE = {
	messageCounter: 0,
	root: null,
	connected: false,
	containers: [],
	contexts: {},
	queue: [],
	next() {
		return ++this.messageCounter;
	},
	flush() {
		this.queue.forEach(send);
		this.queue = []; // @TODO: Maybe wait for an ACK before flushing
	}
});

/**
*
* cmdName takes a command message and returns the constructor.name value or '??'
*
* @params {Function} cmd - a command Message
* @return cmd.constructor.name or '??'
*
**/

export const cmdName = cmd => {
	let mod, name, cls;

	for (mod in commands) {
		for (name in commands[mod]) {
			cls = commands[mod][name];
			if (cmd && cmd.constructor && cls === cmd.constructor) return `${mod}.${name}`;
		}
	}
	return (cmd && cmd.constructor && cmd.constructor.name) || '??';
};

window.addEventListener(
	'message',
	message => {
		const data = (message && message.data) || {};

		if (data.from === 'ArchDevToolsPageScript' && data.state === 'initialized') {
			_ARCH_DEV_TOOLS_STATE.connected = true;
			_ARCH_DEV_TOOLS_STATE.flush();
		}

		if (data.from !== 'ArchDevToolsPanel') {
			return;
		}
		if (!_ARCH_DEV_TOOLS_STATE.root) {
			return;
		}
		const sel = data.selected;

		if (sel && sel.path && sel.next && sel.prev) {
			_ARCH_DEV_TOOLS_STATE.root.set(set(lensPath(sel.path), sel.next, sel.prev));
		}
	},
	false
);

/**
*
*
*
**/

export const intercept = stateManager => (_ARCH_DEV_TOOLS_STATE.root = stateManager);

/**
*
*
*
**/

export const notify = ({ context, msg, prev, next, path, cmds }) => {
	const { container } = context;

	const serialized = serialize({
		id: session + _ARCH_DEV_TOOLS_STATE.next(),
		name: container.name,
		ts: Date.now(),
		prev,
		next,
		path,
		from: 'Arch',
		relay: context.relay(),
		message: (msg && msg.constructor && msg.constructor.name) || `Init (${container.name})`,
		data: msg && msg.data,
		commands: pipe(flatten, filter(is(Object)), map(cmd => [cmdName(cmd), cmd.data]))(cmds)
	});

	_ARCH_DEV_TOOLS_STATE.containers.includes(container) ||
		_ARCH_DEV_TOOLS_STATE.containers.push(container);
	_ARCH_DEV_TOOLS_STATE.contexts[context.id] = context;

	if (!_ARCH_DEV_TOOLS_STATE.connected) {
		return _ARCH_DEV_TOOLS_STATE.queue.push(serialized);
	}
	_ARCH_DEV_TOOLS_STATE.flush();
	send(serialized, '*');
};
