import * as History from 'history';
import { pipe } from 'ramda';
import { Back, PushHistory, ReplaceHistory, Timeout } from '../commands/browser';
import Message, { MessageConstructor } from '../message';

export const history = typeof window === 'undefined' || process.env.NODE_ENV === 'test' ?
  History.createMemoryHistory() : History.createBrowserHistory();

export default new Map<MessageConstructor, (data: any, dispatch: any) => any>([
  [PushHistory, ({ path, state }) => history.push(path, state || {})],
  [ReplaceHistory, ({ path, state }) => history.replace(path, state || {})],
  [Back, () => history.goBack()],
  [Timeout, ({ result, timeout }, dispatch) => setTimeout(
    () => pipe(Message.construct(result), dispatch)({}),
    timeout
  )],
]);
