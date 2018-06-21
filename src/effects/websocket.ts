import Message, { MessageConstructor } from '../message';
import { Process, ProcessState, ProcessStateData } from '../subscription';
import { Listener, Send } from '../commands/websocket';
import { curry, difference, keys, merge, path, pick, pipe, uniq } from 'ramda';

class BackOff {

  public current: number = 0;
  public timer: number = null;
  public max: number = 10;
  public delay: number = 100;
  public fn: Function = null;
  public key: any = null;

  constructor(config: { [key: string]: any } = {}) {
    Object.assign(this, config);
  }

  public stop(): void {
    this.reset({ max: 0, fn: null });
  }

  public reset(config: any = {}): void {
    this.timer && clearTimeout(this.timer);
    Object.assign(this, { ...config, current: 0, timer: null });
  }

  public retry(key: typeof BackOff.prototype.key): void {
    const { timer, current, delay, max, fn } = this;
    if (!fn || timer || current > max || (this.key && key !== this.key)) { return; }

    const onTimeout = () => {
      fn();
      this.timer = null;
    };

    Object.assign(this, {
      current: current + 1,
      timer: setTimeout(onTimeout, delay * Math.pow(2, current))
    });
  }
}

type SocketData = {
  url: string;
  result: MessageConstructor;
  error?: MessageConstructor;
  open?: MessageConstructor;
  close?: MessageConstructor;
  dispatch: Function;
};

class Socket extends Process {

  private url: string = null;
  private connection: WebSocket = null;
  private queue: any[] = [];
  private dispatch: any;
  private messages: { result?: any; error?: any; open?: any; close?: any } = {};
  private retryState: BackOff;

  private dispatchMsg: any = curry((key: string, data) => {
    this.messages[key] && this.dispatch(Message.construct(this.messages[key], data));
  });

  constructor({ url, result, error, open, close, context, dispatch }: (ProcessStateData & SocketData)) {
    super();
    Object.assign(this, {
      url,
      context,
      dispatch,
      messages: { result, error, open, close },
      retryState: new BackOff({ fn: this.start.bind(this) }),
    });
  }

  public start(): void {
    try {
      this.connection = this.config(new WebSocket(this.url));
    } catch (e) {
      this.dispatchMsg('error', { type: e.name, message: e.message });
    }
  }

  public stop(): void {
    this.retryState.stop();

    try {
      this.connection.close();
    } catch (e) {}
  }

  private config(socket: WebSocket): WebSocket {
    socket.addEventListener('open', () => {
      this.retryState.reset({ key: socket });
      if (!this.queue.length) { return; }
      this.queue.forEach(this.send.bind(this));
      this.queue = [];
    });

    socket.addEventListener('message', pipe(pick(['data', 'origin', 'timeStamp']), this.dispatchMsg('result')));

    socket.addEventListener('close', () => {
      this.retryState.retry(socket);
      this.dispatchMsg('close', {});
    });

    socket.addEventListener('error', (event) => {
      this.retryState.retry(socket);
      this.dispatchMsg('error', {});
    });

    return socket;
  }

  private send(message: any): void {
    const { queue, connection, messages: { error } } = this;

    if (!connection || connection.readyState !== WebSocket.OPEN) {
      queue.push(message);
      if (queue.length > 1000) { this.queue = queue.slice(1); }

      return;
    }

    try {
      this.connection.send(message);
    } catch (e) {
      error && this.dispatch(Message.construct(error, { type: e.name, message: e.message }));
    }
  }
}

export default new Map([
  [Listener, (processState: ProcessState & any, dispatch) => {
    const { context, current, data, state } = processState;
    const config = current || new Map();
    const all = uniq(data.map(path(['data', 'url'])));
    const scope = config.get(context) || {};

    if (state === ProcessState.STOPPED) {
      keys(scope).forEach(url => scope[url].stop());
      config.delete(context);
      processState.set(config);

      return;
    }

    data.filter(({ data: { url } }) => !scope[url]).forEach(({ data: sub }) => {
      scope[sub.url] = new Socket({ ...sub, context, dispatch });
      scope[sub.url].start();
    });

    difference(keys(scope), all).forEach((url) => {
      scope[url].stop();
      delete scope[url];
    });

    config.set(context, scope);
    processState.set(config);
  }],

  [Send, ({ url, message, result, error, }, dispatch, execContext) => {
    const socket = Array.from(execContext.stateManager().processes.get(Listener).values()).reduce(merge, {})[url];
    socket && socket.send(message) || dispatch(Message.construct(error, { type: 'NoConnection', url, message }));
  }],
]);
