import createHistory from "history/createBrowserHistory";
import { PushHistory, ReplaceHistory, Back } from "../commands/browser";

/**
*
* The history export's documentation is found at {@link https://www.npmjs.com/package/history}
*
* The Map constructor function manages the browser history and uses the history package to
* build the functionality for PushHistory, ReplaceHistory, and Back Messages that will update the view.
* Additionally, PushHistory and ReplaceHistory functions verify that the path is a string.
*
**/

export const history = createHistory();

export default new Map([
	[PushHistory, ({ path, state }) => history.push(path, state || {})],
	[ReplaceHistory, ({ path, state }) => history.replace(path, state || {})],
	[Back, ({ state }) => history.goBack(state)]
]);
