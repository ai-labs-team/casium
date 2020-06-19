import { expect } from 'chai';
import 'mocha';
import StateManager from './state_manager';

describe('StateManager', () => {

  describe('#set', () => {

    it('sends state updates to listeners', () => {
      const stateMgr = new StateManager({ foo: true }), log = [];
      stateMgr.subscribe(log.push.bind(log));
      stateMgr.set({ bar: true });
      expect(log).to.deep.equal([{ foo: true }, { bar: true }]);
    });

    it('does not broadcast to listeners removed mid-update', () => {
      const stateMgr = new StateManager({ foo: true });
      let unSub, toggle = false, log: any[] = [];
      const a = () => { toggle && unSub(); log.push('a'); };
      const b = () => { log.push('b'); };

      stateMgr.subscribe(a);
      unSub = stateMgr.subscribe(b);

      log = [];
      stateMgr.set({ bar: true });
      expect(log).to.deep.equal(['a', 'b']);

      toggle = true;
      log = [];
      stateMgr.set({ foo: true });
      expect(log).to.deep.equal(['a']);
    });
  });
});
