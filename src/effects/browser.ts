import createHistory from 'history/createBrowserHistory';
import { pipe } from 'ramda';
import Message from '../message';
import { Back, PushHistory, ReplaceHistory, Timeout } from '../commands/browser';
import { constructMessage } from '../util';

export const history = createHistory();

interface Constructor {
  new(): Message;
}

export default new Map<Constructor, (data: any, dispatch: any) => any>([
  [PushHistory, ({ path, state }) => history.push(path, state || {})],
  [ReplaceHistory, ({ path, state }) => history.replace(path, state || {})],
  [Back, ({ state }) => history.goBack(state)],
  [Timeout, ({ result, timeout }, dispatch) => setTimeout(
    () => pipe(constructMessage(result), dispatch)({}),
    timeout
  )],
]);
