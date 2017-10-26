import createHistory from 'history/createBrowserHistory';
import { pipe } from 'ramda';
import { Back, PushHistory, ReplaceHistory, Timeout } from '../commands/browser';
import Message from '../message';
import { constructMessage } from '../util';
/**
* The history export's documentation is found at {@link https://www.npmjs.com/package/history}
**/
export const history = createHistory();

interface Constructor {
  new(): Message;
}

/**
* The Map constructor function manages the browser history and uses the history package to
* build the functionality for PushHistory, ReplaceHistory, and Back Messages that will update the view.
* Additionally, PushHistory and ReplaceHistory functions verify that the path is a string.
**/

export default new Map<Constructor, (data: any, dispatch: any) => any>([
  [PushHistory, ({ path, state }) => history.push(path, state || {})],
  [ReplaceHistory, ({ path, state }) => history.replace(path, state || {})],
  [Back, ({ state }) => history.goBack(state)],
  [
    Timeout,
    ({ result, timeout }, dispatch) =>
      setTimeout(() => pipe(constructMessage(result), dispatch)({}), timeout)
  ]
]);
