import * as Cookies from 'js-cookie';
import Message, { Constructor, Emittable } from '@casium/core/src/message';
import { moduleName } from '@casium/core/util';

@moduleName('Cookies')
export class Read extends Message<{ key: string, result: Emittable<any> }> {}

@moduleName('Cookies')
export class Write extends Message<{
  key: string,
  value: string | { [key: string]: any },
  expires?: Date,
  path?: string
}> {}

@moduleName('Cookies')
export class Delete extends Message<{ key: string }> {}

export default new Map<Constructor<any, Message<any>>, (data: any, dispatch: any) => any>([
  [Read, ({ key, result }, dispatch) => Promise.resolve(Cookies.getJSON(key)).then(
    (data: any = {}) => dispatch(Message.construct(result, data))
  )],
  [Write, ({ key, value, path, expires }) => Cookies.set(key, value, {
    path: path || '/',
    expires: expires || null,
  })],
  [Delete, ({ key }) => Cookies.remove(key)],
]);
