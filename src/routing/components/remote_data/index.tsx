import {
  always, anyPass, assoc, curry, either,
  filter, ifElse, length, path, pipe, prop, reduce, toPairs, values
} from 'ramda';
import * as React from 'react';
import parse from 'url-parse';
import * as _RemoteData from '../../remote_data';

import { default as _Loaded } from './loaded';
import { default as _Loading } from './loading';

export const LOADED = _Loaded;
export const LOADING = _Loading;

// tslint:disable-next-line:variable-name
const _href = keys => path(['_links', ...keys, 'href']);

export const href = curry((type, entity) => _href([type])(entity));
export const self = href('self');
type Props<T> = {
  data: { [K in keyof T]: _RemoteData.RemoteData<T[K]> };
  loading: () => React.Component<any>;
  loaded: (data: T) => React.Component<any>;
  policy?: any[];
};

// Each character can be neatly fitted into six bits. (<64 elements)
//
// We are going to place the digits and symbols haphazardly to make
// the final output seem like an ID.
const forward = '0123456789abcdefghijklmnopqrstuvwxyz-/_?&=';

// This is the Base-64 alphabet, which is also indexed by six bits.
// How convenient!
const bckward = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const forwardTable = new Map();

class BadCharError extends Error {}
class BadFurlError extends Error {}

const lookup = (source, table, char) => {
  if (table.size === 0) {
    source
      .split('')
      .forEach((char, i) => {
        table.set(char, i);
      });
  }
  if (!table.has(char)) {
    throw new BadCharError('bad char');
  }
  return table.get(char);
};

/** furl is the alternative to btoa that we use to encode the long HATEOAS URLs */
export const furl = (cleartext) => {
  if (!cleartext) {
    throw new BadFurlError(`unable to furl ${cleartext}`);
  }
  const parsed = parse(cleartext);
  const path = parsed.pathname + parsed.query;

  if (!path) {
    throw new BadFurlError(`unable to furl ${cleartext}`);
  }
  try {
    return path
      .toLowerCase()
      .split('')
      .map(char => bckward.charAt(lookup(forward, forwardTable, char)))
      .join('');
  } catch (e) {
    if (e instanceof Error) {
      throw new BadFurlError(`unable to furl ${cleartext}`);
    } else {
      throw e;
    }
  }
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
