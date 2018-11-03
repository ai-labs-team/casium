import { GenericObject } from '../..';
import Message, { MessageConstructor } from '../../message';

export class RemoteDataError extends Message { }
export class NavigationUpdated extends Message { }
export class LoadRouteData extends Message { }
export class RouteDataLoaded extends Message { }
export class RootLinksReceived extends Message { }

export type NavigationModel = {
  route: string;
  data: ({ title: string; breadcrumb?: any, hideHeader: boolean, replace?: boolean });
  params: GenericObject;
  components?: any[];
  conditions?: any[];
  state?: any[];
};

export type State = {
  $: {
    url?: string | { root: string };
    data?: { [key: string]: any };
    component?: any;
    conditions?: (...args: any[]) => boolean;
  };
  [key: string]: any;
};

export type NavigationConfig = {
  result?: MessageConstructor;
  error?: MessageConstructor;
  always?: MessageConstructor;
  states?: {
    [key: string]: State
  };
  current?: NavigationModel;
  load: MessageConstructor;
};

export class Navigation extends Message {
  constructor(config: NavigationConfig) {
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
