import deepFreeze from 'deep-freeze-strict';
import { always, complement as not, curry, is, merge, pickBy, when } from 'ramda';
import { suppressEvent } from './util';

export type MessageConstructor<T> = Constructor<T, Message<T>> & { defaults: Partial<T> };

type BaseEmittable<T> = MessageConstructor<T> | [MessageConstructor<T>, Partial<T>];
export type Emittable<T> = BaseEmittable<T> | [BaseEmittable<T>, Partial<T>];

export interface Constructor<M, T extends AbstractMessage<M>> {
  defaults: Partial<M>;
  new(data?: M, opts?: MessageOptions): T;
}

export type MessageOptions = {
  shallow?: boolean;
};

abstract class AbstractMessage<T> {

  public static defaults = {};

  public static initialize<T>(msg: AbstractMessage<T>, data: T, opts: MessageOptions = {}) {
    const ctor = msg.constructor as Constructor<T, AbstractMessage<T>>;
    msg.data = merge(ctor.defaults, data);

    if (opts && opts.shallow) {
      Object.freeze(msg);
      Object.freeze(msg.data);
    } else {
      deepFreeze(msg);
    }
  }

  public data: T;
}

export class Command<T> extends AbstractMessage<T> {

  constructor(data: T) {
    super();
    AbstractMessage.initialize(this, data, {});
  }

  public map(fn: (data: T) => T): Command<T> {
    const ctor = this.constructor as Constructor<T, Command<T>>;
    return new ctor(fn(this.data));
  }
}

export default class Message<T = any> extends AbstractMessage<T> {
  // tslint:disable member-ordering

  /**
   * Maps an emittable and message data to a message.
   */
  public static construct = curry(<T>(msgType: MessageConstructor<T>, data: any) => {
    const [type, extra] = Message.toEmittable(msgType);
    return new type(merge(data, extra));
  });

  public static toEmittable = when(not(is(Array)), type => [type, {}]);

 /**
  * Maps an Event object to a hash that will be wrapped in a Message.
  */
  public static mapEvent = curry((extra: object & { preventDefault?: boolean }, event: Event) => {
    const target = event.target as HTMLInputElement;
    const isDomEvent = event && (event as any).nativeEvent && is(Object, target);
    const isCheckbox = isDomEvent && target.type && target.type.toLowerCase() === 'checkbox';
    const value = isDomEvent && (isCheckbox ? target.checked : target.value);
    const eventVal = isDomEvent ? { value, ...pickBy(not(is(Object)), event) } : event;

    if (isDomEvent && !isCheckbox && extra.preventDefault !== false) {
      suppressEvent(event);
    }
    return [{ event: always(event) }, eventVal, extra].reduce(merge);
  });

  constructor(data: T) {
    super();
    AbstractMessage.initialize(this, data, {});
  }

  public map(fn: (data: T) => T): Message<T> {
    const ctor = this.constructor as MessageConstructor<T>;
    return new ctor(fn(this.data));
  }
}

export class Activate extends Message<any> {}
export class Refresh extends Message<any> {}
export class Deactivate extends Message<any> {}
