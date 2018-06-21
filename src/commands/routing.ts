import Message, { MessageConstructor } from '../message';

export type State = {
  $: {
    url?: string | { root: string };
    data?: { [key: string]: any };
    component?: any;
    conditions?: (...args: any[]) => boolean;
  };
  [key: string]: any;
};

export type NavigationConfig<T> = {
  result?: MessageConstructor;
  error?: MessageConstructor;
  always?: MessageConstructor;
  states?: {
    [key: string]: State
  };
  current?: T;
  load: MessageConstructor;
};

export class Navigation<T> extends Message {
  constructor(config: NavigationConfig<T>) {
    super(config);
  }
}

export class Load extends Message {
}

export class Navigate extends Message {

  constructor(config: { state: string, params?: { [key: string]: any } }) {
    super(config);
  }
}

export const states: State = {
  $: {}
};
