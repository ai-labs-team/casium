import { expect } from 'chai';
import 'mocha';
import { always } from 'ramda';
import Message from './message';

describe('Message', () => {

  describe('is', () => {

    it('does not throw on invalid values', () => {
      expect(() => Message.is(false)).not.to.throw;
      expect(() => Message.is(null)).not.to.throw;
      expect(() => Message.is(undefined)).not.to.throw;
    });

    it('accepts a Message', () => {
      class CoolMessage extends Message<any> {}
      expect(Message.is(CoolMessage)).to.be.true;
    });

    it('does not accept a function', () => {
      expect(Message.is(() => {})).to.be.false;
    });

    it('accepts a subclass of a subclass of a subclass of Message', () => {
      class SubClass extends Message<any> {}
      class SubSubClass extends SubClass {}
      class SubSubSubClass extends SubSubClass {}
      expect(Message.is(SubSubSubClass)).to.be.true;
    });
  });

  describe('constructor()', () => {
    it('populates data on init', () => {
      expect((new Message({ foo: true }))).to.deep.equal({ foo: true });
    });

    it('freezes data', () => {
      const msg = new Message({ foo: true });

      expect(() => { (msg as any).rando = false; }).to.throw(TypeError);
      expect(() => { (msg as any).data.bar = true; }).to.throw(TypeError);
      expect(() => { msg.data.foo = false; }).to.throw(TypeError);

      expect(msg.data).to.deep.equal({ foo: true });
    });
  });

  describe('map()', () => {
    it('uses the correct constructor', () => {
      class Foo extends Message<any> {}
      const msg = (new Foo({ bar: true })).map(always({ bar: false, baz: true }));

      expect(msg.data).to.deep.equal({ bar: false, baz: true });
      expect(msg).to.be.an.instanceof(Foo);
    });
  });
});
