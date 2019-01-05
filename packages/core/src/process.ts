import Message, { MessageConstructor } from './message';
import ExecContext from './runtime/exec_context';

export type State = '@process/running' | '@process/stopped';

export const RUNNING: State = '@process/running';
export const STOPPED: State = '@process/stopped';

// tslint:disable-next-line:variable-name
export const EffectType = Symbol.for('@effect/type');

export type Config = {
  [EffectType]: MessageConstructor;
  state: State;
  context: ExecContext<any>;
  data: Message[];
  current: any;
  set: (state: any) => any;
};

export abstract class Thread {

  constructor(public data: any = {}) { }

  public start(config: Message): void { }

  public update(config: Message): void { }

  public stop(): void { }
}

export class Snapshot {

  public static RUNNING = RUNNING;
  public static STOPPED = STOPPED;

  public state: State = Snapshot.RUNNING;
  public context: any;
  public data: any;
  public current: any;
  public set: (state: any) => any;

  constructor(data: Config) {
    Object.assign(this, data);
  }
}
