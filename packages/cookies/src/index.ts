import Message, { Command, Constructor, Emittable } from '@casium/core/message';
import { moduleName } from '@casium/core/util';
import * as Cookies from 'js-cookie';

@moduleName('Cookies')
export class Read extends Command<{ key: string, result: Emittable<any> }> {}

@moduleName('Cookies')
export class Write extends Command<{
  key: string,
  value: string | { [key: string]: any },
  expires?: Date,
  path?: string
}> {}

@moduleName('Cookies')
export class Delete extends Command<{ key: string }> {}

export default new Map<Constructor<any, Command<any>>, (data: any, dispatch: any) => any>([
  [Read, ({ key, result }, dispatch) => Promise.resolve(Cookies.getJSON(key)).then(
    (data: any = {}) => dispatch(Message.construct(result, data))
  )],
  [Write, ({ key, value, path, expires }) => Cookies.set(key, value, {
    path: path || '/',
    expires: expires || null,
  })],
  [Delete, ({ key }) => Cookies.remove(key)],
]);
