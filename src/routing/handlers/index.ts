import {
  anyPass, assocPath, both, clone, complement, cond, defaultTo, equals, filter, head,
  identity, ifElse, is, map, mergeAll, mergeDeepRight,
  not, nth, omit, path, pipe, prop, reduce, T, toPairs, values, when
} from 'ramda';

import { commands, message, seq } from '../../';

import { Delete } from '../../commands/local_storage';

import { LoadRouteData, NavigationUpdated, RemoteDataError } from '../messages';

import * as Batch from '../../commands/batch';
import { exists } from '../../utils';

import * as RemoteData from '../remote_data';

const resourcesToPaths = pipe(
  map(pipe(prop('remoteData'), defaultTo({}), map(prop('path')))),
  mergeAll,
);

const setResourcesToLoaded = model => pipe(
  values,
  reduce((acc, { path, data, map }) =>
    assocPath(
      path,
      RemoteData.loaded((map || identity)(data)),
      acc
    ),
         model
  ),
);

const instantiateResources = model => pipe(
  resourcesToPaths,
  toPairs,
  map(nth(1)),
  reduce((acc, val) => (
    path(val, model) &&
    !RemoteData.is(RemoteData.NOT_LOADED, path(val, model)) &&
    path([...val, 'data'], model)
      ? assocPath(val, RemoteData.reloading(path(val, model)), acc)
      : assocPath(val, RemoteData.loading(), acc)),
         {}
  )
);

const toBatch = (model, { params, filtered }, relay) => pipe(
  defaultTo([]),
  pipe(
    map((mapper) => {
      const cmd = mapper.cmd(model, params, relay);

      return ({ ...mapper, cmd, url: cmd.data.url || cmd.data.key });
    }),
    defaultTo([]),
    when(complement(is(Array)), Array.of),
    head,
  )
)(filtered);

type UpdateNavigation = {
  params?: any;
  data?: any;
  state: {
    [key: string]: any;
  };
};

const updateNavigation = (model, { params = {}, data = {}, state, ...rest }: UpdateNavigation) => [{
  ...model,
  routing: {
    ...model.routing,
    previous: clone(model.routing.navigation),
    navigation: {
      ...model.routing.navigation,
      route: state,
      params,
      ...data,
    }
  },
  navIsOpen: false,
}];

const forceNavigationByPath = (pathnameOverride = ['']) => (model, msg, { routes }) =>
  updateNavigation(model, { ...msg, state: path(pathnameOverride, routes) });

const reqData = path([0, 'remoteData']);

const otherData = (requestedData) => {
  const { remoteData, conditions } = requestedData[0];

  const dependencies = filter(rd => rd.dependencies, remoteData || []);

  const otherData = requestedData.slice(1);
  exists(dependencies) &&
    otherData.splice(0, 0, { remoteData: map(omit(['dependencies']), dependencies), conditions });

  return otherData;
};

const createBatch = (model, { params, requestedData }, relay) => new Batch.All({
  commands: toBatch(model, { params, filtered: filter(rd => !rd.dependencies, reqData(requestedData) || []) }, relay),
  result: LoadRouteData,
  error: RemoteDataError,
  passThrough: { params, requestedData: otherData(requestedData) }
});

export default [

  [NavigationUpdated, updateNavigation],

  [RemoteDataError, cond([
    // Redirects to Sign-in if there is a a 401 or 403 error
    [message(
      // tslint:disable-next-line:no-suspicious-comment
      /* @TODO: Add check so this only applies to root API URLs */
      pipe(
        path(['response', 'status']),
        anyPass([equals(401), equals(403)])
      )),
      seq(
        assocPath(['resources', 'token'], RemoteData.notLoaded()),
        commands(Delete, { key: 'TOKEN_DATA' }),
        forceNavigationByPath(['root', 'signIn']),
      )
    ],

    // Else let's just leave the model as identity
    [T, identity],
  ])],

  [LoadRouteData, ifElse(
    message(pipe(prop('data'), exists, not)),
    (model, { params, requestedData, route, back }, relay) => [
      mergeDeepRight(model, {
        ...instantiateResources(model)(requestedData),
        routing: {
          navigation: {
            route: route || model.routing.navigation.route,
            data: back || model.routing.navigation.data,
          },
        },
      }),
      requestedData.length > 0 && createBatch(model, { params, requestedData }, relay)
    ],
    (model, { data, params, requestedData }, relay) => {
      const newModel = exists(data) ? setResourcesToLoaded(model)(data) : model;

      return ifElse(
        () => requestedData[0] && exists(requestedData[0].conditions) && !requestedData[0].conditions(newModel),
        ifElse(
          message(pipe(path(['requestedData', 0]), both(path(['data', 'redirectOnFailure']), prop('redirect')))),
          (model, { params, requestedData }) => updateNavigation(newModel, {
            state: requestedData[0].redirect,
            params,
          }),
          // There needs to be a common 404 route, so for now this is redirecting to home
          // which will redirect to sign in as need
          (model, { }, { routes }) =>
            updateNavigation(newModel, { state: routes.root.auth.home, data: { components: ['NotFoundRedirect'] } }),
        ),
        () => [
          newModel,
          exists(requestedData) && createBatch(newModel, { params, requestedData }, relay),
          ...model.dataLoaded(newModel, { data }, relay)
        ]);
    },
  )],
];
