import { expect } from 'chai';
import 'mocha';
import { Post, Request } from './commands/http';
import { Read } from './commands/local_storage';
import dispatcher, { handler } from './dispatcher';
import effects from './effects';
import Message from './message';

describe('dispatcher', () => {

  describe('handler()', () => {

    class Msg extends Message<any> {}

    it('returns the message constructor when a match is found', () => {
      expect(handler(effects, new Read({ key: 'foo', result: Msg }))).to.deep.equal(Read);
    });

    it('returns a constructor superclass', () => {
      expect(handler(effects, new Post({ url: '/', result: Msg, error: Msg }))).to.deep.equal(Request);
    });
  });

  describe('dispatcher()', () => {
    it('throws when dispatching invalid input', () => {
      expect(() => dispatcher(new Map([]), {}, {})).to.throw(TypeError, /type 'Object' is not acceptable/);
    });

    it('throws when dispatching an unhandled message', () => {
      class Msg extends Message<any> {}

      expect(() => dispatcher(new Map([]), {}, new Msg({}))).to.throw(TypeError, /Unhandled/);
    });

  });
});
