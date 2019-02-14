import Message, { Command, Constructor, Emittable } from '@casium/core/message';
import { moduleName } from '@casium/core/util';

@moduleName('Timer')
export class Timeout extends Command<{ timeout: number, result: Emittable<any> }> {}

export default new Map<Constructor<any, Message<any>>, (data: any, dispatch: any) => any>([
  [Timeout, ({ result, timeout, ...data }, dispatch) => setTimeout(
    () => dispatch(Message.construct(result, {})),
    timeout
  )],
]);
