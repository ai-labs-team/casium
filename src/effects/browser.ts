import * as History from 'history';
import { pipe } from 'ramda';
import { Back, PushHistory, ReplaceHistory, Timeout } from '../commands/browser';
import Message, { MessageConstructor } from '../message';

export const history = typeof window === 'undefined' ? History.createMemoryHistory() : History.createBrowserHistory();

export default new Map<MessageConstructor, (data: any, dispatch: any) => any>([
  [PushHistory, ({ path, state }) => history.push(path, state || {})],
  [ReplaceHistory, ({ path, state }) => history.replace(path, state || {})],
  [Back, ({ state }) => history.goBack(state)],
  [Timeout, ({ result, timeout }, dispatch) => setTimeout(
    () => pipe(Message.construct(result), dispatch)({}),
    timeout
  )],
]);
