import * as deepFreeze from 'deep-freeze-strict';
import { both, curry, either as or, identity, ifElse, is, isEmpty, join, merge, nth, pipe } from 'ramda';
import { getValidationFailures, safeStringify } from './util';

export interface MessageConstructor {
  new(data?: any, opts?: any): Message;
}

export type MessageOptions = {
  shallow?: boolean;
};

export default class Message {
  // tslint:disable member-ordering

  /**
   * Maps an emittable and message data to a message.
   */
  public static construct = curry((msgType: MessageConstructor, data: any) => {
    const [type, extra] = Message.toEmittable(msgType);
    return new type(merge(data, extra));
  });

  /**
   * Checks that a value is a message constructor.
   */
  public static is = val => val && val.prototype && val.prototype instanceof Message;

  /**
   * Checks that a value is emittable as a message constructor
   */
  public static isEmittable = or(Message.is, both(is(Array), pipe(nth(0), Message.is)));

  public static toEmittable = ifElse(is(Array), identity, type => [type, {}]);

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
