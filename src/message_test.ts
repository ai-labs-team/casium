import { expect } from 'chai';
import 'mocha';
import { is } from 'ramda';
import Message from './message';

describe('Message', () => {

  describe('is', () => {

    it('does not throw on invalid values', () => {
      expect(() => Message.is(false)).not.to.throw;
      expect(() => Message.is(null)).not.to.throw;
      expect(() => Message.is(undefined)).not.to.throw;
    });

    it('accepts a Message', () => {
      class CoolMessage extends Message {}
      expect(Message.is(CoolMessage)).to.be.true;
    });

    it('does not accept a function', () => {
      expect(Message.is(() => {})).to.be.false;
    });

    it('accepts a subclass of a subclass of a subclass of Message', () => {
      class SubClass extends Message {}
      class SubSubClass extends SubClass {}
      class SubSubSubClass extends SubSubClass {}
      expect(Message.is(SubSubSubClass)).to.be.true;
    });
  });

  describe('#constructor', () => {
    it('populates data on init', () => {
      expect((new Message({ foo: true })).data).to.deep.equal({ foo: true });
    });

    it('freezes data', () => {
      const msg = new Message({ foo: true });

      expect(() => { (msg as any).rando = false; }).to.throw(TypeError);
      expect(() => { msg.data.foo = false; }).to.throw(TypeError);
      expect(() => { msg.data.bar = true; }).to.throw(TypeError);

      expect(msg.data).to.deep.equal({ foo: true });
    });

    it('validates its inputs', () => {
      class Msg extends Message { public static expects = { foo: is(Function) }; }

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
        public static expects = { foo: is(String), bar: is(Number) };
      }
      expect(() => new Foo({ foo: 'hello', bar: 1138 })).to.not.throw();
      expect(() => new Foo({ foo: 1138, bar: 1138 })).to.throw(TypeError);
    });
  });

});
