/* eslint-env node, mocha */
import { Cookies } from '../commands';
import Message from '../message';

describe('cookies', () => {
  describe('Read.result', () => {
    class CoolMessage extends Message {}

    it('result accepts a Message', () => {
      expect(() => new Cookies.Read({ key: 'bleh', result: CoolMessage })).to.not.throw();
    });

    it('result does not accept a function', () => {
      expect(() => new Cookies.Read({ key: 'bleh', result: () => {} }))
        .to.throw(TypeError, /failed expectations in Read: \{result}/);
    });
  });
});
