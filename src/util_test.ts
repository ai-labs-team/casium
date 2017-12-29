import { expect } from 'chai';
import 'mocha';
import { is } from 'ramda';
import Message from './message';
import { getValidationFailures, isMessage, merge, withProps } from './util';

describe('util', () => {

  describe('validateTypes', () => {
    it('should work', () => {
      expect(getValidationFailures({ foo: is(String) })({ foo: 'hello' })).to.be.empty;
      expect(getValidationFailures({ foo: is(String) })({ foo: 1138 })).to.have.lengthOf(1);
    });
  });

  describe('merge', () => {
    it('should merge deeply nested objects', () => {
      expect(merge({
        foo: { bar: true, baz: true },
        dib: false,
      },           {
        foo: { bar: false },
      })).to.eql({
        foo: { bar: false, baz: true },
        dib: false,
      });
    });

    it('should merge deeply nested arrays', () => {
      expect(merge({
        foo: { list: [1, 3] },
      },           {
        foo: { list: [2, 4] },
      })).to.eql({
        foo: { list: [1, 3, 2, 4] },
      });
    });

    it('should merge top-level items', () => {
      expect(merge({
        foo: 'hello',
        bar: 'there',
      },           {
        foo: 'goodbye',
      })).to.eql({
        foo: 'goodbye',
        bar: 'there',
      });
    });
  });

  describe('getValidationFailures', () => {
    it('it specifies nothing because it is all good!', () => {
      const nothing = getValidationFailures({ foo: is(String), bar: is(Function) })({
        bar: () => {}, foo: 'Hello'
      });
      expect(nothing.length).to.equal(0);
    });

    it('it specifies field `bar` because it should be a function, but it is a string', () => {
      const justBar = getValidationFailures({ foo: is(String), bar: is(Function) })({
        bar: 'not Func', foo: 'Hello'
      });
      expect(justBar.length).to.equal(1);
      expect(justBar[0]).to.equal('bar');
    });
  });

  describe('#withProps', () => {
    const defaultFnMap = { fun1: () => {} };
    const defaultComponent = props => props;
    const defaultProps = {};

    it(`passes when fnMap is an object with functions & component is a function that takes 1 arg`, () => {
      expect(() => withProps(defaultFnMap, defaultComponent, defaultProps)).to.not.throw();
    });

    it('succeeds when fnMap is empty object', () => {
      expect(() => withProps({}, defaultComponent, defaultProps)).to.not.throw();
    });

    it('succeeds when fnMap is object with 3 functions', () => {
      const fnMap = {
        a: () => {},
        b: (one, two, four) => (one + two + four),
        c: one => one,
      };
      expect(() => withProps(fnMap, defaultComponent, defaultProps)).to.not.throw();
    });

    it('fails when fnMap is object with undefined field', () => {
      expect(() => withProps({ a: undefined }, defaultComponent, defaultProps)).to.throw(
        TypeError, /withProps failed/
      );
    });

    it('fails when fnMap is object with null field', () => {
      expect(() => withProps({ a: null }, defaultComponent, defaultProps)).to.throw(
        TypeError, /withProps failed/
      );
    });

    it('fails when fnMap is object with one string field and some function fields', () => {
      const fnMap = {
        a: () => {},
        b: 'GOTCHA! (not)',
        c: one => (one),
      };
      expect(() => withProps(fnMap, defaultComponent, defaultProps)).to.throw(TypeError, /withProps failed/);
    });

    it('fails when fnMap is object with one string field', () => {
      const fnMap = {
        a: 'GOTCHA! (not)',
      };
      expect(() => withProps(fnMap, defaultComponent, defaultProps)).to.throw(TypeError, /withProps failed/);
    });
  });

  describe('isMessage', () => {

    it('does not throw on invalid values', () => {
      expect(() => isMessage(false)).not.to.throw;
      expect(() => isMessage(null)).not.to.throw;
      expect(() => isMessage(undefined)).not.to.throw;
    });

    it('accepts a Message', () => {
      class CoolMessage extends Message {}
      expect(isMessage(CoolMessage)).to.be.true;
    });

    it('does not accept a function', () => {
      expect(isMessage(() => {})).to.be.false;
    });

    it('accepts a subclass of a subclass of a subclass of Message', () => {
      class SubClass extends Message {}
      class SubSubClass extends SubClass {}
      class SubSubSubClass extends SubSubClass {}
      expect(isMessage(SubSubSubClass)).to.be.true;
    });
  });

});
