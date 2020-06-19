import Message from './message';

const RUNNING = Symbol.for('@process/running');
const STOPPED = Symbol.for('@process/stopped');

// tslint:disable-next-line:variable-name
export const EffectType = Symbol.for('@effect/type');

export type ProcessStateData = {
  state?: symbol;
  context: any;
  data: any;
  current: any;
  set: (state: any) => any;
};

export abstract class Process {

  constructor(public data: any = {}) {
  }

  public start(config: Message): void {}

  public update(config: Message): void {}

  public stop(): void {}
}

export class ProcessState {

  public static RUNNING = RUNNING;
  public static STOPPED = STOPPED;

  public state: symbol = ProcessState.RUNNING;
  public context: any;
  public data: any;
  public current: any;
  public set!: (state: any) => any;

  constructor(data: ProcessStateData) {
    Object.assign(this, data);
  }
}

export default class Subscription {

  public processes!: Map<any, Process[]>;
}
