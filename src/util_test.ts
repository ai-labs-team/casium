import { expect } from 'chai';
import 'mocha';
import { is } from 'ramda';
import { getValidationFailures, mergeDeep, replace, strictReplace, withProps } from './util';

describe('util', () => {

  describe('validateTypes', () => {
    it('should work', () => {
      expect(getValidationFailures({ foo: is(String) })({ foo: 'hello' })).to.be.empty;
      expect(getValidationFailures({ foo: is(String) })({ foo: 1138 })).to.have.lengthOf(1);
    });
  });

  describe('merge', () => {
    it('should merge deeply nested objects', () => {
      expect(mergeDeep({
        foo: { bar: true, baz: true },
        dib: false,
      },               {
        foo: { bar: false },
      })).to.eql({
        foo: { bar: false, baz: true },
        dib: false,
      });
    });

    it('should merge deeply nested arrays', () => {
      expect(mergeDeep({
        foo: { list: [1, 3] },
      },               {
        foo: { list: [2, 4] },
      })).to.eql({
        foo: { list: [1, 3, 2, 4] },
      });
    });

    it('should merge top-level items', () => {
      expect(mergeDeep({
        foo: 'hello',
        bar: 'there',
      },               {
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

  describe('replace', () => {
    it('returns a function', () => {
      expect(typeof replace({})).to.equal('function');
    });

    it('replaces stuff', () => {
      // Note that bar could be a string or a boolean.
      expect(replace({ foo: 1, bar: 'baz' })({ foo: 3, bar: true, guf: 'yerp' }))
        .to.deep.equal({ foo: 1, bar: 'baz', guf: 'yerp' });
    });
  });

  describe('strictReplace', () => {
    type FooBarGuf = {
      foo: number,
      bar: string,
      guf: string,
    };
    it('does the same thing as replace, but takes a parameterize type', () => {
      // Note that bar has to be the same type in both the source and destination objects,
      // otherwise this wouldn't compile!
      expect(strictReplace<FooBarGuf>({ foo: 1, bar: 'baz' })({ foo: 3, bar: 'true', guf: 'yerp' }))
        .to.deep.equal({ foo: 1, bar: 'baz', guf: 'yerp' });
    });
  });

  describe('#withProps', () => {
    const defaultFnMap = { fun1: () => {} };
    const defaultComponent = props => props;
    const defaultProps = {};

    it(`passes when fnMap is an object with functions & component is a function that takes 1 arg`, () => {
      expect(() => withProps(defaultFnMap, defaultComponent)(defaultProps)).to.not.throw();
    });

    it('succeeds when fnMap is empty object', () => {
      expect(() => withProps({}, defaultComponent)(defaultProps)).to.not.throw();
    });

    it('succeeds when fnMap is object with 3 functions', () => {
      const fnMap = {
        a: () => 1,
        b: ({ one, two, four }) => (one + two + four),
        c: one => one,
      };
      expect(() => withProps(fnMap, defaultComponent)(defaultProps)).to.not.throw();
    });
  });

});
