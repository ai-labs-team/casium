import { filter, flatten, is, lensPath, map, pipe, set } from 'ramda';
import * as commands from './commands';
import Message from './message';
import { safeParse, safeStringify } from './util';

export type DevTools = {
  messageCounter: number,
  root?: any,
  connected: boolean,
  containers: any[],
  contexts: object,
  queue: any[],
  next: () => number,
  flush: () => void
};

type DevToolsMessage = {
  context: any;
  container: any;
  msg: Message;
  prev?: object;
  next: object;
  path: any[];
  cmds: any[];
  subs: any[];
};

let send = (msg: any) => {};
const session = Date.now() + Math.random().toString(36).substr(2);
const serialize = map(pipe(safeStringify, safeParse));

export const _ARCH_DEV_TOOLS_STATE: DevTools = {
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
};

export const cmdName = (cmd) => {
  let mod, name, cls;

  for (mod in commands) {
    for (name in commands[mod]) {
      cls = commands[mod][name];
      if (cmd && cmd.constructor && cls === cmd.constructor) {
        return `${mod}.${name}`;
      }
    }
  }
  return cmd && cmd.constructor && cmd.constructor.name || '??';
};

const inBoundMsgHandler = (message: object & { data: any }) => {
  const data = message && message.data || {};

  if (data.from === 'CasiumDevToolsPageScript' && data.state === 'initialized') {
    _ARCH_DEV_TOOLS_STATE.connected = true;
    _ARCH_DEV_TOOLS_STATE.flush();
  }

  if (data.from !== 'CasiumDevToolsPanel' || !_ARCH_DEV_TOOLS_STATE.root) {
    return;
  }
  const sel = data.selected;

  if (sel && sel.path && sel.next && sel.prev) {
    _ARCH_DEV_TOOLS_STATE.root.set(set(lensPath(sel.path), sel.next, sel.prev));
  }
};

export const intercept = stateManager => _ARCH_DEV_TOOLS_STATE.root = stateManager;

export const notify = ({ context, msg, prev, next, path, cmds }: DevToolsMessage) => {
  const { container } = context;

  const serialized = serialize({
    context: context.id,
    id: session + _ARCH_DEV_TOOLS_STATE.next(),
    name: container.name,
    ts: Date.now(),
    prev,
    next,
    path,
    from: 'Arch',
    relay: context.relay(),
    message: msg && msg.constructor && msg.constructor.name || `Init (${container.name})`,
    data: msg && msg.data,
    commands: pipe(flatten, filter(is(Object)), map(cmd => [cmdName(cmd), cmd.data]))(cmds),
  } as any);

  _ARCH_DEV_TOOLS_STATE.containers.includes(container) || _ARCH_DEV_TOOLS_STATE.containers.push(container);
  _ARCH_DEV_TOOLS_STATE.contexts[context.id] = context;

  if (!_ARCH_DEV_TOOLS_STATE.connected) {
    _ARCH_DEV_TOOLS_STATE.queue.push(serialized);
  } else {
    _ARCH_DEV_TOOLS_STATE.flush();
    send(serialized);
  }
};

if (typeof window !== 'undefined') {
  send = (msg: any) => window.postMessage(msg, '*');
  window.addEventListener('message', inBoundMsgHandler, false);
  Object.assign(window as any, { _ARCH_DEV_TOOLS_STATE });
}
