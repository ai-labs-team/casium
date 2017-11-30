import * as deepFreeze from 'deep-freeze-strict';
import { is, isEmpty, join, merge } from 'ramda';
import { getValidationFailures, safeStringify } from './util';

export type MessageOptions = {
  shallow?: boolean;
};

export default class Message {

  protected static defaults: object = {};
  protected static expects: object = {};

  public data: any;

  constructor(data: any = {}, opts: MessageOptions = {}) {
    const ctor = this.constructor as any;
    this.check(data);
    this.data = merge(ctor.defaults, data);

    const invalidTypes = getValidationFailures(ctor.expects)(this.data);

    if (!isEmpty(invalidTypes)) {
      const msgData = safeStringify(data), types = join(', ', invalidTypes);
      throw new TypeError(`Message data ${msgData} failed expectations in ${ctor.name}: ${types}`);
    }

    if (opts && opts.shallow) {
      Object.freeze(this);
      Object.freeze(this.data);
    } else {
      deepFreeze(this);
    }
  }

  public map(data): Message {
    return new (this.constructor as any)(merge(this.data, data));
  }

  private check(data) {
    if (is(Object, data)) {
      return;
    }
    throw new Error([
      'Message data must be an object in message',
      this.constructor.name,
      'but is',
      safeStringify(data),
    ].join(' '));
  }
}

export class Activate extends Message {}
export class Refresh extends Message {}
export class Deactivate extends Message {}
