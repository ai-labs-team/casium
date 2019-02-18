import Message, { Command, Constructor } from '@casium/core/message';
import { moduleName } from '@casium/core/util';

@moduleName('History')
export class ReplaceHistory extends Command<{ path: string }> {}

@moduleName('History')
export class PushHistory extends Command<{ path: string }> {}

@moduleName('History')
export class Back extends Command<{}> {}

@moduleName('History')
export class Forward extends Command<{}> {}

const noOp: any = () => {};

export const history = (() => (
  (typeof window === 'undefined' || (typeof process !== 'undefined' && process.env.NODE_ENV === 'test'))
    ? { back: noOp, forward: noOp, pushState: noOp, replaceState: noOp }
    : window.history
))();

export default new Map<Constructor<any, Message<any>>, (data: any, dispatch: any) => any>([
  [PushHistory, ({ path, title, state }) => history.pushState(state, title, path)],
  [ReplaceHistory, ({ path, title, state }) => history.replaceState(state, title, path)],
  [Back, () => history.back()],
  [Forward, () => history.forward()]
]);
