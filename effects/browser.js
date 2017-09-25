import createHistory from 'history/createBrowserHistory';
import { PushHistory, ReplaceHistory, Back } from 'architecture/commands/browser';

export const history = createHistory();

export default new Map([
  [PushHistory, ({ path, state }) => history.push(path, state || {})],
  [ReplaceHistory, ({ path, state }) => history.replace(path, state || {})],
  [Back, ({ state }) => history.goBack(state)],
]);
