import { services as coreServices } from '@uirouter/core/lib/common/coreservices';
import { UrlMatcher } from '@uirouter/core/lib/url/urlMatcher';
import { UrlMatcherFactory } from '@uirouter/core/lib/url/urlMatcherFactory';
import {
  assoc, clone, concat, curry, equals, ifElse, isEmpty, isNil, map, merge, omit, path,
  pick, pipe, prop, reduce, replace as replaceStr, split, toPairs,
} from 'ramda';
import Message, { MessageConstructor } from '../../message';
import ExecContext from '../../runtime/exec_context';
import { ProcessState } from '../../subscription';
import { exists } from '../../utils';
import Maybe from '../../utils/maybe';

import { Navigate, Navigation, NavigationUpdated } from '../messages';

type RequestDataType = {
  conditions: () => {},
  remoteData: {
    [key: string]: {
      path?: string[],
      cmd: Message
      map: () => {},
    },
  },
};

export type RouteDataRequest = {
  params: any;
  requestedData: RequestDataType[];
};

type DataType = {
  state: any[];
  components: any[];
  data?: any;
  conditions?: any[];
  remoteData?: any[];
  redirect?: any;
  requestData: RequestDataType[];
  //componentsWithNeeds: { component: string, policy: string, needs: any[] };
};

type State = {
  data: DataType;
  params: {};
  pathname: string;
};

type Location = {
  state: string[];
  params: { [key: string]: any };
  path: string;
  query: string;
};

enum RoutingState {
  RemoteDataLoading = 'loading',
  RemoteDataLoaded = 'loaded',
  RemoteDataNotLoaded = 'not loaded',
}

type RouteProcessState = {
  routes: [any, UrlMatcher];
  location: Location;
  pending: any;
  unsubscribe?: () => any | void;
  remoteDataState: RoutingState;
};

type EffectHandler = (data: ProcessState | any, dispatch: any, ctx: ExecContext<any>) => void | any;

interface RouteDef {
  url?: string;
  component?: string;
  data?: { [key: string]: any };
  conditions?: () => boolean;
  requirements?: { [key: string]: Requirement };
  redirect: any; //TODO fix type
};

interface Route {
  $: RouteDef,
  [key: string]: any; //TODO fix type
};

type Requirement = {
  path: string[];
  data?: { [key: string]: any };
  dependencies?: string[];
}

type InternalRoute = RouteDef & {
  parent?: {
    //key of routemap
  },
  urlMatcher: UrlMatcher
};

type MatchedRoute = {
  route: Route;
  params: { [key: string]: string };
  url: string;
};

type RouteMap = Map<RouteDef, InternalRoute>;
//Map<RouteDef, { urlMatcher: UrlMatcher, route: InternalRoute: { ...RouteDef,  parent: } }>
type History = { 
  prev?: MatchedRoute[]; 
  current: MatchedRoute; 
  next?: MatchedRoute[];
};

type InternalModel = {
  routes?: RouteMap;
  history?: History;
};

type Config = {
  routes?: Route;
  current?: MatchedRoute;
};

// tslint:disable-next-line:variable-name
// const History = () => ({
//   state: '/',
//   pushState(data: any, title: string, url?: string | null): void {
//     // tslint:disable-next-line:no-invalid-this
//     this.state = url;
//   },
//   replaceState(data: any, title: string, url?: string | null): void {
//     // tslint:disable-next-line:no-invalid-this
//     this.state = url;
//   },
//   subscribe: () => {},
//   unsubscribe: () => {},
// });

const getStateKey = (state, routesMap) => routesMap.get(state) || routesMap.get(Array.from(routesMap.keys())
.find(key => equals(state, JSON.parse(JSON.stringify(key)))));

//export const history = typeof window === undefined || process.env.NODE_ENV === 'test' ? History() : window.history;

const history: History | { current?: MatchedRoute, prev?: MatchedRoute[], next?: MatchedRoute[] } = {};

Object.assign(coreServices, {
  $injector: { invoke: fn => fn() }, $q: { when: Promise.resolve, reject: Promise.reject }
});

const urlBuilder = new UrlMatcherFactory();

const routesMap: RouteMap = new Map();

const buildRouteMap = (routes, parent: { urlMatcher?: any; [key: string]: any } = {} ): [Route, InternalRoute][] => {
  return pipe(
    toPairs,
    reduce((acc, [key, val]) => {
     // const route = clone(parent) || {};
      const root = val.$;
      const local = urlBuilder.compile(root.url, {
        strict: false,
        caseInsensitive: false,
      });

      const qualified = exists(parent) ? parent.urlMatcher.append(local) : local;
      let route = clone(val);
      route.urlMatcher = qualified;
      route = parent ? assoc('parent', parent, route) : route;

      return acc.concat([[val, route]]).concat(buildRouteMap(omit(['$'], val), route))
    })([]),
  )(routes);
  // { key: val } -> toPairs -> map([key, val] => [[state, route]])
  // [[state, route]].concat(buildRouteMap(state, state.children))
  // return Object.keys(routes).map((route) => {
    // const currentRoute = routes[route];
    // const data = currentRoute.$;


    // // {
    // //   components: 'SOmething',
    // //   parent: { components: 'parent'}
    // // }

    // const newObj = {
    //   state: currentRoute,
    //   components: parent.components ? data.component ? parent.components.concat(data.component) : parent.components : data.component ? [data.component] : [],
      // requestData:
      //   parent.requestData ? parent.requestData.concat([{
      //     remoteData: data.remoteData || null,
      //     conditions: data.conditions || null,
      //     redirect: data.redirect || null,
      //     data: data.data || {}
      //   }]) : [{
      //     remoteData: data.remoteData || null,
      //     conditions: data.conditions || null,
      //     redirect: data.redirect || null,
      //     data: data.data || {}
      //   }],
      // conditions: parent.conditions ? parent.conditions.concat([data.conditions || null]) : [data.condtions || null],
      // data: merge(parent.data, data.data),
      // redirect: data.redirect,
      // remoteData: parent.remoteData ? parent.remoteData.concat([[data.remoteData || null]]) : [data.remoteData || null],
      // componentsWithNeeds:
      //   parent.componentsWithNeeds ? parent.componentsWithNeeds.concat([{
      //     component: data.component,
      //     policy: 'Loaded',
      //     needs: Object.keys(data.remoteData || {})
      //   }]) : [{
      //     component: data.component,
      //     policy: 'Loaded',
      //     needs: Object.keys(data.remoteData || {})
      //   }],
    //};

  //   routesMap.set(currentRoute, { data: newObj, urlMatcher: qualified });
  //   const children = omit(['$'], currentRoute);
  //   exists(children) && buildRouteMap(children, { ...newObj, urlMatcher: local });
  // });
};

const matchRoute = (routes, { pathname, search }): Maybe<MatchedRoute> =>
   Maybe.of(Array.from(routes.entries()).find(([route, data]) => !isNil(data.urlMatcher.exec(pathname, search)))) 
    .map(([route, data]) => ({ route: data, params: data.urlMatcher.exec(pathname, search), url: pathname }));

const updateHistory = (currentRoute: MatchedRoute) => {
  //TODO update prev/next arrays
  // history.prev = history.prev.push(history.current);
  history.current = currentRoute;
}

export default new Map<MessageConstructor, EffectHandler>([
  [Navigate, (props, dispatch) => dispatch(new NavigationUpdated({
    ...props,
  }))],

  // tslint:disable-next-line:cyclomatic-complexity
  [Navigation, (processState: ProcessState & any, dispatch, execContext: ExecContext<any>) => {
    const { data: navigation, state } = processState;
    const current: InternalModel = processState.current || { routes: null, history: null };
    const config: Config = navigation[0].data;

    if(!current.routes && !config.routes) {
      return;
    }

    if(!current.routes && config.routes) {
      current.routes = new Map(buildRouteMap(config.routes, null));
    }

    if(!exists(history)) {
      const matchedRoute: Maybe<MatchedRoute> = matchRoute(current.routes, window.location);
      console.log(matchedRoute.value());
      updateHistory(matchedRoute.value());
    }

  }],

  ]);

// if (!current.unsubscribe && exists(current.routes)) {
//   window.addEventListener('popstate', browserNavHandler);
//   current.unsubscribe = () => window.removeEventListener('popstate', browserNavHandler);
// }

// processState.set(merge(current, { location }));