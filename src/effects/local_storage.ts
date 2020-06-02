import { always, merge, objOf, pipe } from 'ramda';
import { Clear, Delete, Read, Write } from '../commands/local_storage';
import Message from '../message';
import { safeParse, safeStringify } from '../util';

const get = (() => {
  try {
    return typeof window === 'undefined'
      ? always('<running outside browser context>')
      : window && window.localStorage && window.localStorage.getItem.bind(window.localStorage);
  } catch (e) {
    return always(e);
  }
})();

export default new Map([
  [Read, ({ key, result }, dispatch) => (pipe(
    get, safeParse, objOf('value'), merge({ key }), Message.construct(result), dispatch
  ) as any)(key)],
  [Write, ({ key, value }) => window.localStorage.setItem(key, safeStringify(value))],
  [Delete, ({ key }) => window.localStorage.removeItem(key)],
  [Clear, () => window.localStorage.clear()],
]);
