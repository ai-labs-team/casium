import * as History from 'history';
import { pipe } from 'ramda';
import { Back, PushHistory, ReplaceHistory, Timeout } from '../commands/browser';
import { constructMessage, Constructor } from '../util';

export const history = typeof window === 'undefined' ? History.createMemoryHistory() : History.createBrowserHistory();

export default new Map<Constructor, (data: any, dispatch: any) => any>([
  [PushHistory, ({ path, state }) => history.push(path, state || {})],
  [ReplaceHistory, ({ path, state }) => history.replace(path, state || {})],
  [Back, ({ state }) => history.goBack(state)],
  [Timeout, ({ result, timeout }, dispatch) => setTimeout(
    () => pipe(constructMessage(result), dispatch)({}),
    timeout
  )],
]);
