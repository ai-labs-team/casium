import Message, { Constructor, Emittable } from '@casium/core/message';
import { moduleName, safeParse, safeStringify } from '@casium/core/util';
import { always, merge, objOf, pipe } from 'ramda';

@moduleName('Storage')
export class Read extends Message<{ key: string, result: Emittable<any> }> {}

@moduleName('Storage')
export class Write extends Message<{ key: string; value: any }> {}

@moduleName('Storage')
export class Delete extends Message<{ key: string }> {}

@moduleName('Storage')
export class Clear extends Message<{}> {}

const get = (() => {
  try {
    return typeof window === 'undefined'
      ? always('<running outside browser context>')
      : window && window.localStorage && window.localStorage.getItem.bind(window.localStorage);
  } catch (e) {
    return always(e);
  }
})();

export default new Map<Constructor<any, Message<any>>, (data: any, dispatch: any) => any>([
  [Read, ({ key, result }, dispatch) => pipe(
    get, safeParse, objOf('value'), merge({ key }), Message.construct(result), dispatch
  )(key)],
  [Write, ({ key, value }) => window.localStorage.setItem(key, safeStringify(value))],
  [Delete, ({ key }) => window.localStorage.removeItem(key)],
  [Clear, () => window.localStorage.clear()],
]);
