import { expect } from 'chai';
import 'mocha';
import { Post, Request } from './commands/http';
import { Read } from './commands/local_storage';
import { handler } from './dispatcher';
import effects from './effects';
import Message from './message';

describe('dispatcher', () => {

  describe('handler()', () => {

    class Msg extends Message {}

    it('returns the message constructor when a match is found', () => {
      expect(handler(effects, new Read({ key: 'foo', result: Msg }))).to.deep.equal(Read);
    });

    it('returns a constructor superclass', () => {
      expect(handler(effects, new Post({ url: '/', result: Msg, error: Msg }))).to.deep.equal(Request);
    });

  });
});
