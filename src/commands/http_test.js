/* eslint-env node, mocha */
import Message from '../message';
import { Request } from './http';

describe('http', () => {
  class TestMessage extends Message {}

  describe('Request.result', () => {
    it('result accepts a Message', () => {
      expect(() => new Request({
        method: 'GET', url: '/', result: TestMessage, error: TestMessage
      })).to.not.throw();
    });

    it('result does not accept a function', () => {
      expect(() => new Request({
        method: 'GET', url: '/', result: () => {}, error: TestMessage
      })).to.throw(TypeError, /failed expectations in Request: result/);
    });
  });

  describe('Request.error', () => {
    it('error accepts a Message', () => {
      expect(() => new Request({
        method: 'GET', url: '/', result: TestMessage, error: TestMessage
      })).to.not.throw();
    });

    it('error does not accept a function', () => {
      expect(() => new Request({
        method: 'GET', url: '/', result: TestMessage, error: () => {}
      })).to.throw(TypeError, /failed expectations in Request: error/);
    });
  });
});
