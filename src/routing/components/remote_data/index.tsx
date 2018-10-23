import {
  always, anyPass, assoc, either,
  filter, ifElse, length, pipe, prop, reduce, toPairs, values
} from 'ramda';
import * as React from 'react';
import { furl, self } from '../../../utils';
import * as _RemoteData from '../../remote_data';

import { default as _Loaded } from './loaded';
import { default as _Loading } from './loading';

export const LOADED = _Loaded;
export const LOADING = _Loading;

type Props<T> = {
  data: { [K in keyof T]: _RemoteData.RemoteData<T[K]> };
  loading: () => React.Component<any>;
  loaded: (data: T) => React.Component<any>;
  policy?: any[];
};

export const defaultPolicy = [
  _RemoteData.is(_RemoteData.LOADED),
  _RemoteData.is(_RemoteData.RELOADING),
];

export const loadedPolicy = [
  _RemoteData.is(_RemoteData.LOADED),
];

const objectLength = pipe(values, length);

const getResourceId = ifElse(
  either(_RemoteData.is(_RemoteData.LOADED), _RemoteData.is(_RemoteData.RELOADING)),
  pipe(prop('data'), self, furl),
  always('')
);

export const sameResource = (resource, furledId) => getResourceId(resource) === furledId;

export const itemsPassPolicy = (policy, data) =>
  objectLength(filter(anyPass(policy), data)) === objectLength(data);

interface RemoteData<T> extends React.SFC<T> {
  <T>(props: Props<T>): JSX.Element;
}
// tslint:disable-next-line:variable-name
const RemoteData = ({ data, loaded, loading, policy = defaultPolicy }) => {

  const mapProps = pipe(
    toPairs,
    reduce((acc, [key, resource]) => assoc(key, resource.data, acc), {})
  );

  return (
    itemsPassPolicy(policy, data)
      ? loaded(mapProps(data))
      : loading()
  );
};

export default RemoteData;
