import { pipe } from 'ramda';
import createHistory from 'history/createBrowserHistory';
import { PushHistory, ReplaceHistory, Back, Timeout } from '../commands/browser';
import { constructMessage } from '../util';

export const history = createHistory();

export default new Map([
  [PushHistory, ({ path, state }) => history.push(path, state || {})],
  [ReplaceHistory, ({ path, state }) => history.replace(path, state || {})],
  [Back, ({ state }) => history.goBack(state)],
  [Timeout, ({ result, timeout }, dispatch) => setTimeout(
    () => pipe(constructMessage(result), dispatch)({}),
    timeout
  )],
]);
