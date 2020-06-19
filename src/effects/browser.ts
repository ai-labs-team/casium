import { pipe } from 'ramda';
import { Back, Forward, PushHistory, ReplaceHistory, Timeout } from '../commands/browser';
import Message, { MessageConstructor } from '../message';

const noOp: any = () => {};

export const history = (() => (
  (typeof window === 'undefined' || (typeof process !== 'undefined' && process.env.NODE_ENV === 'test'))
    ? { back: noOp, forward: noOp, pushState: noOp, replaceState: noOp }
    : window.history
))();

export default new Map<MessageConstructor, (data: any, dispatch: any) => any>([
  [PushHistory, ({ path, title, state }) => history.pushState(state, title, path)],
  [ReplaceHistory, ({ path, title, state }) => history.replaceState(state, title, path)],
  [Back, () => history.back()],
  [Forward, () => history.forward()],
  [Timeout, ({ result, timeout, ...data }, dispatch) => setTimeout(
    () => (pipe(Message.construct(result), dispatch) as any)({}),
    timeout
  )],
]);
