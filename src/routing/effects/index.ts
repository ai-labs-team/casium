import { services as coreServices } from '@uirouter/core/lib-esm/common/coreservices';
import { UrlMatcher } from '@uirouter/core/lib-esm/url/urlMatcher';
import { UrlMatcherFactory } from '@uirouter/core/lib-esm/url/urlMatcherFactory';
import {
  concat, curry, equals, ifElse, isEmpty, isNil, map, merge, omit, path,
  pick, pipe, prop, reduce, replace as replaceStr, split,
} from 'ramda';
import Message, { MessageConstructor } from '../../message';
import ExecContext from '../../runtime/exec_context';
import { ProcessState } from '../../subscription';
import { safeParse, safeStringify } from '../../util';
import { exists } from '../../utils';
import Maybe from '../../utils/maybe';

import { LoadToken, Navigate, Navigation, NavigationUpdated } from '../messages';

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
  componentsWithNeeds: { compoent: string, policy: string, needs: any[]};
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

// tslint:disable-next-line:variable-name
const History = () => ({
  state: '/',
  pushState(data: any, title: string, url?: string | null): void {
    // tslint:disable-next-line:no-invalid-this
    this.state = url;
  },
  replaceState(data: any, title: string, url?: string | null): void {
    // tslint:disable-next-line:no-invalid-this
    this.state = url;
  },
  subscribe: () => {},
  unsubscribe: () => {},
});

export const history = typeof window === undefined || process.env.NODE_ENV === 'test' ? History() : window.history;

Object.assign(coreServices, {
  $injector: { invoke: fn => fn() }, $q: { when: Promise.resolve, reject: Promise.reject }
});

const urlBuilder = new UrlMatcherFactory();

const defaultState = {
  state: {},
  components: [],
  data: { title: '', breadcrumb: {},  hideHeader: false },
  requestData: [],
  conditions: [],
  remoteData: [],
  componentsWithNeeds: [],
};

const crawl = (index, parent, parentObject, states, routesMap) => {
  const obj = !isEmpty(parentObject) ? parentObject : defaultState;

  return Object.keys(states).map((key) => {
    const state = states[key];
    const data = state.$;
    const local = urlBuilder.compile(data.url, {
      strict: false,
      caseInsensitive: false,
    });

    const qualified = parent ? parent.append(local) : local;

    const newObj = merge(obj, {
      state,
      components: data.component ? obj.components.concat(data.component) : obj.components,
      requestData:
        obj.requestData.concat([{
          remoteData: data.remoteData || null,
          conditions: data.conditions || null,
          redirect: data.redirect || null,
          data: data.data || {}
        }]),
      conditions: obj.conditions.concat([data.conditions || null]),
      data: merge(obj.data, data.data),
      redirect: data.redirect,
      remoteData: obj.remoteData.concat([[data.remoteData || null]]),
      componentsWithNeeds:
        obj.componentsWithNeeds.concat([{
          component: data.component,
          policy: 'Loaded',
          needs: Object.keys(data.remoteData || {})
        }])
    });

    const current = index.concat([[newObj, qualified]]);

    routesMap.set(state, { data: newObj, urlMatcher: qualified });

    return Object.keys(state).length === 0 ? current : current.concat(...crawl(
      index,
      qualified,
      newObj,
      omit(['$'], state),
      routesMap,
    ));
  });
};

const matchUrl = (routes, pathname, query): State => pathname && pathname !== '/' ?
  Maybe.of(routes.find(([{ }, matcher]) => !isNil(matcher.exec(pathname, query))))
    .map(([data, matcher]) => ({ data, params: matcher.exec(pathname, query), pathname }))
    .defaultTo({ data: {}, params: {}, pathname })
    : Maybe.of(routes.find(([data, matcher]) => data.data.defaultRoute))
    .map(([data, matcher]) => ({ data, params: matcher.exec(pathname), pathname }))
    .defaultTo({ data: {}, params: {}, pathname });

const getStateKey = (state, routesMap) => routesMap.get(state) || routesMap.get(Array.from(routesMap.keys())
.find(key => equals(state, JSON.parse(JSON.stringify(key)))));

const changeState = ({ data, matcher, params = {}, historyChange = 'push', location }) => {
  const newPath = matcher.format(params);

  const newUrl = [window.location.origin, newPath.replace(/^\//, '')].join('/');
  const replace = data.data.replace || historyChange === 'replace';

  if (historyChange !== 'back' && !equals(location.path, newPath)) {
    history[replace ? 'replaceState' : 'pushState']({ state: JSON.stringify(data.state), params }, '', newUrl);

    window.scrollTo(0, 0);
  }

  return {
    data,
    params: merge(location.query, params),
    pathname: newPath,
  };
};

const findState = ({ route: state, params, data: { replace, back } }, routes, location, routesMap): any =>
  Maybe.of(getStateKey(state, routesMap))
    .map(ifElse(
      path(['data', 'redirect']),
      ({ data: { redirect } }) => findState(
        { route: redirect, params, data: { replace: true, back } },
        routes,
        location,
        routesMap
      ),
      ({ data, urlMatcher }) => changeState({
        data,
        matcher: urlMatcher,
        params,
        historyChange: back ? 'back' : replace ? 'replace' : 'push',
        location,
      }),
    )).value();

/**
 *  @param path    the current url in the browser
 *  @param routes  all of the possible route states
 *
 *  @returns state
 *
 *  derieves a state from given path
 *
 */
const navigate = (location: Location, routes, routesMap): any => {
  const match = matchUrl(routes, location.path, location.query);

  if (match.data.redirect && !match.data.data.redirectOnFailure) {
    return Maybe.of(findState({ route: match.data.redirect, params: match.params, data: match.data.data },
                              routes,
                              location,
                              routesMap,
    )).map(pick(['data', 'params', 'pathname'])).value();
  }

  return match;

};

const checkLocation = ({ current, location, e, path }) => {
  const newLocation = exists(e.state) ? e.state : matchUrl(current.routes, path, location.query);

  return equals((current.location || location), newLocation) ? null : newLocation;
};

const handler = (e: PopStateEvent, current, path, location, routesMap) =>
  Maybe.of(checkLocation({ current, location, e, path }))
  .map(({ state, params, data: matchedState }) => {
    if (matchedState && matchedState.state) {
      return { data: matchedState, params, pathname: path };
    }

    const { data, urlMatcher } = getStateKey(JSON.parse(state), routesMap);

    return { data, params, pathname: urlMatcher.format(merge(params, location.query)) };
  }).value();

export const splitQuery = pipe(
  replaceStr(/^\?/, ''),
  split('&'),
  map(split('=')),
  reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {}),
);

const checkCurrent = (current, config) => current.location &&
  !equals(current.location.state, config.current.state);

// tslint:disable:max-func-body-length
export default new Map<MessageConstructor, EffectHandler>([
  [LoadToken, ({ key, result, error }, dispatch, execContext: ExecContext<any>) => {
    const query = window.location.search !== '' ? splitQuery(window.location.search) : {};

    if (query.authToken) {
      const { authToken } = query;

      try {
        window.localStorage.setItem(key, safeStringify(safeParse(window.atob(authToken))));
        const newQuery = new URLSearchParams(window.location.search);
        newQuery.delete('authToken');
        window.location.search = newQuery.toString();
      } catch (e) {
        console.warn(`Failure to store auth ${authToken}`); // tslint:disbale:no-console
      }
    }

    dispatch(Message.construct(result, { key, value: safeParse(window.localStorage[key] || null) }));
  }],

  [Navigate, ({ ...props }, dispatch) => dispatch(new NavigationUpdated({
    ...props,
  }))],

  // tslint:disable-next-line:cyclomatic-complexity
  [Navigation, (processState: ProcessState & any, dispatch, execContext: ExecContext<any>) => {
    const { data: navigation, state } = processState;
    const config = navigation[0].data;
    const current: RouteProcessState = processState.current || {
      routes: null,
      location: null,
      pending: null,
      unsubscribe: null,
      remoteDataState: RoutingState.RemoteDataNotLoaded,
    };
    const isInitializing = !exists(current.routes) && exists(config.states);
    const routesMap = new Map();
    const { remoteDataState } = current;

    const pathname = window.location.pathname !== 'blank' ? window.location.pathname : history.state;
    const query = window.location.search !== '' ? splitQuery(window.location.search) : {};

    const location: Location = { state: [], params: {}, path: pathname, query };

    const enqueueMsg = curry((msg, data) => (
      (!isEmpty(data) || msg === config.error)
        && requestAnimationFrame(pipe(Message.construct(msg), dispatch).bind(null, data))
    ));

    const browserNavHandler = (e) => {
      if (e.defaultPrevented) {
        return;
      }

      const state = handler(e, current, pathname, location, routesMap);
      location.params = state.params;
      location.state = state.data.state;

      enqueueMsg(config.load, {
        params: state.params,
        requestedData: prop('requestData', state.data),
        route: state.data.state,
        back: true,
      });

      current.remoteDataState = RoutingState.RemoteDataLoading;
    };

    if (state === ProcessState.STOPPED) {
      current.unsubscribe && current.unsubscribe();

      return processState.set({});
    }

    current.routes = exists(config.states) && reduce(concat, [], crawl([], null, {}, config.states, routesMap)) || [];

    if (isInitializing && remoteDataState === RoutingState.RemoteDataNotLoaded) {
      const { data, params }: State = navigate(location, current.routes, routesMap);
      location.state = data.state;
      location.params = params;

      enqueueMsg(config.load, { params, requestedData: prop('requestData', data) });
      current.remoteDataState = RoutingState.RemoteDataLoading;
    } else if (checkCurrent(current, config) && current.remoteDataState === RoutingState.RemoteDataLoaded) {
      const foundState = findState(config.current, current.routes, location, routesMap);
      if (exists(foundState)) {
        const { data, params } = foundState;
        location.state = data.state;
        location.params = params;
        enqueueMsg(config.load, {
          params,
          requestedData: prop('requestData', data),
        });

        current.remoteDataState =  RoutingState.RemoteDataLoading;
      }
    } else if (current.remoteDataState === RoutingState.RemoteDataLoading) {
      const { data, urlMatcher } = getStateKey(current.location.state, routesMap);
      location.state = data.state;
      location.params = urlMatcher.exec(location.path, location.query);

      document.title = data.data.title;

      current.remoteDataState =  RoutingState.RemoteDataLoaded;
      enqueueMsg(config.result, { data, params: location.params });
    }

    if (!current.unsubscribe && exists(current.routes)) {
      window.addEventListener('popstate', browserNavHandler);
      current.unsubscribe = () => window.removeEventListener('popstate', browserNavHandler);
    }

    processState.set(merge(current, { location }));
  }],
]);
