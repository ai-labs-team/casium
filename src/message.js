import { is, merge, isEmpty, join } from 'ramda';
import deepFreeze from 'deep-freeze-strict';
import { getValidationFailures, safeStringify } from './util';

export default class Message {

  static defaults = {};
  static expects = {};

  constructor(data = {}, opts = {}) {
    const ctor = this.constructor;
    this._check(data);
    this.data = merge(ctor.defaults, data);

    const invalidTypes = getValidationFailures(ctor.expects)(this.data);

    if (!isEmpty(invalidTypes)) {
      throw new TypeError(`Message data ${safeStringify(data)} failed expectations in ${ctor.name}: {${join(', ', invalidTypes)}}`);
    }

    if (opts && opts.shallow) {
      Object.freeze(this);
      Object.freeze(this.data);
    } else {
      deepFreeze(this);
    }
  }

  _check(data) {
    if (is(Object, data)) {
      return;
    }
    const msg = [
      'Message data must be an object in message',
      this.constructor.name,
      'but is',
      safeStringify(data),
    ];
    throw new Error(msg.join(' '));
  }

  map(data) {
    return new this.constructor(merge(this.data, data));
  }
}

export class Activate extends Message {}
