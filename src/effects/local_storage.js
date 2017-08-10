import { pipe, objOf, merge } from 'ramda';
import { Read, Write, Delete, Clear } from '../commands/local_storage';
import { safeParse, safeStringify, constructMessage } from '../util';

const get = window.localStorage.getItem.bind(window.localStorage);

export default new Map([
  [Read, ({ key, result }, dispatch) => pipe(
    get,
    safeParse,
    objOf('value'),
    merge({ key }),
    constructMessage(result),
    dispatch
  )(key)],
  [Write, ({ key, value }) => window.localStorage.setItem(key, safeStringify(value))],
  [Delete, ({ key }) => window.localStorage.removeItem(key)],
  [Clear, () => window.localStorage.clear()],
]);
