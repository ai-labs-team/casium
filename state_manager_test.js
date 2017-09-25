/* eslint-env node, mocha */
import StateManager from './state_manager';

describe('StateManager', () => {

  describe('#broadcast', () => {
    it('sends state updates to listeners', () => {
      const stateMgr = new StateManager({ foo: true }), log = [];
      stateMgr.subscribe(log.push.bind(log));
      stateMgr.set({ bar: true });
      expect(log).to.deep.equal([{ foo: true }, { bar: true }]);
    });
  });
});
