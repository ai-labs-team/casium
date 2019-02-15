import Message, { Constructor } from './message';
import ExecContext from './runtime/exec_context';

export type State = '@process/running' | '@process/stopped';

export const RUNNING: State = '@process/running';
export const STOPPED: State = '@process/stopped';

// tslint:disable-next-line:variable-name
export const EffectType = Symbol.for('@effect/type');

export type Config<T> = {
  [EffectType]: Constructor<T, Message<T>>;
  state: State;
  context: ExecContext<any>;
  data: Message<T>[];
  current: any;
  set: (state: any) => any;
};

export abstract class Process<T> {

  constructor(public data: any = {}) { }

  public start(config: Message<T>): void { }

  public update(config: Message<T>): void { }

  public stop(): void { }
}

export class Snapshot<T> {

  public static RUNNING = RUNNING;
  public static STOPPED = STOPPED;

  public state: State = Snapshot.RUNNING;
  public context: any;
  public data: any;
  public current: any;
  public set: (state: any) => any;

  constructor(data: Config<T>) {
    Object.assign(this, data);
  }
}
