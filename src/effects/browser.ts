import * as History from 'history';
import { pipe } from 'ramda';
import { Back, PushHistory, ReplaceHistory, Timeout } from '../commands/browser';
import Message, { MessageConstructor } from '../message';

export const history = typeof window === 'undefined' ? History.createMemoryHistory() : History.createBrowserHistory();

export const syncHistoryWithState = history => {

  // const delagate = 'route';
  // const locationPath = 'location';

  // const env = environment({ effects, dispatcher });
  // const stateMgr = intercept(env.stateManager)();

  const getLocationInStore = () => stateMgr.get({ path: [delagate, locationPath] });

  const handleLocationChange = location => {
    stateMgr.set({ location }, { path: [delagate] });
  };

  history.listen(handleLocationChange);

  const unsubscribeFromHistory = history.listen(handleLocationChange);

  return ({
    ...history,

    listen(listener) {
      let lastPublishedLocation = getLocationInStore(true);
      let unsubscribed = false;

      const unsubscribeFromStore = stateMgr.subscribe(() => {
        const currentLocation = getLocationInStore(true);
        if (currentLocation === lastPublishedLocation) {
          return;
        }
        lastPublishedLocation = currentLocation;
        if (!unsubscribed) {
          listener(lastPublishedLocation);
        }
      });

      return () => {
        unsubscribed = true;
        unsubscribeFromStore();
      };
    },

    unsubscribe() {
      unsubscribeFromHistory();
    },
  });
};

export default new Map<MessageConstructor, (data: any, dispatch: any) => any>([
  [PushHistory, ({ path, state }) => history.push(path, state || {})],
  [ReplaceHistory, ({ path, state }) => history.replace(path, state || {})],
  [Back, ({ state }) => history.goBack(state)],
  [Timeout, ({ result, timeout }, dispatch) => setTimeout(
    () => pipe(Message.construct(result), dispatch)({}),
    timeout
  )],
]);
