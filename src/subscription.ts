import Message from './message';

// tslint:disable-next-line:variable-name
export const EffectType = Symbol.for('@effect/type');

export type ProcessStateData = {
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

  public context: any;
  public data: any;
  public current: any;
  public set: (state: any) => any;

  constructor(data: ProcessStateData) {
    Object.assign(this, data);
  }
}

export default class Subscription {

  public processes: Map<any, Process[]>;
}
