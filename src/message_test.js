/* eslint-env node, mocha */
import { is } from 'ramda';
import Message from './message';

describe('Message', () => {

  describe('#constructor', () => {
    it('populates data on init', () => {
      expect((new Message({ foo: true })).data).to.deep.equal({ foo: true });
    });

    it('freezes data', () => {
      const msg = new Message({ foo: true });

      expect(() => { msg.rando = false; }).to.throw(TypeError);
      expect(() => { msg.data.foo = false; }).to.throw(TypeError);
      expect(() => { msg.data.bar = true; }).to.throw(TypeError);

      expect(msg.data).to.deep.equal({ foo: true });
    });

    it('validates its inputs', () => {
      class Msg extends Message { static expects = { foo: is(Function) }; }

      expect(() => new Msg({ foo: null })).to.throw(TypeError);
      expect(() => new Msg({})).to.throw(TypeError);
    });
  });

  describe('#map', () => {
    it('uses the correct constructor', () => {
      class Foo extends Message {}
      const msg = (new Foo({ bar: true })).map({ bar: false, baz: true });

      expect(msg.data).to.deep.equal({ bar: false, baz: true });
      expect(msg).to.be.an.instanceof(Foo);
    });
  });

  describe('#validate', () => {
    it('passes on empty messages', () => {
      expect(() => new Message()).to.not.throw();
    });

    it('throws on unmatched expectations', () => {
      class Foo extends Message {
        static expects = { foo: is(String), bar: is(Number) };
      }
      expect(() => new Foo({ foo: 'hello', bar: 1138 })).to.not.throw();
      expect(() => new Foo({ foo: 1138, bar: 1138 })).to.throw(TypeError);
    });
  });

});
