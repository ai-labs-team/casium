import { expect } from 'chai';
import 'mocha';
import { mergeDeep, withProps } from './util';

describe('util', () => {

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

  describe('withProps()', () => {
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
