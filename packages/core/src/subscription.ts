import { Command } from './message';

// tslint:disable-next-line:variable-name
export const EffectType = Symbol.for('@effect/type');

export type ProcessStateData = {
  state?: symbol;
  context: any;
  data: any;
  current: any;
  set: (state: any) => any;
};

export abstract class Process<T> {

  constructor(public data: any = {}) {}

  public abstract start(config: Command<T>): void;
  public abstract update(config: Command<T>): void;
  public abstract stop(): void;
}

export class ProcessState {

  public static RUNNING = Symbol.for('@process/running');
  public static STOPPED = Symbol.for('@process/stopped');

  public state: typeof ProcessState['RUNNING'] | typeof ProcessState['STOPPED'] = ProcessState.RUNNING;
  public context: any;
  public data: any;
  public current: any;
  public set: (state: any) => any;

  constructor(data: ProcessStateData) {
    Object.assign(this, data);
  }
}
