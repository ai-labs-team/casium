import * as deepFreeze from 'deep-freeze-strict';
import { always, complement as not, curry, is, merge, pickBy, when } from 'ramda';
import { suppressEvent } from './util';

export type MessageConstructor<T> = Constructor<T, Message<T>>;

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

  public static defaults: object = {};
  public data: T;

  constructor(data: T, opts: MessageOptions = {}) {
    const ctor = this.constructor as MessageConstructor<T>;
    this.data = merge(ctor.defaults, data);

    if (opts && opts.shallow) {
      Object.freeze(this);
      Object.freeze(this.data);
    } else {
      deepFreeze(this);
    }
  }

  public map<U>(fn: (data: T) => U): AbstractMessage<U> {
    const ctor = this.constructor as Constructor<U, AbstractMessage<U>>;
    return new ctor(fn(this.data));
  }
}

export class Command<T> extends AbstractMessage<T> {}

export default class Message<T> extends AbstractMessage<T> {
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
}

export class Activate<T> extends Message<T> {}
export class Refresh<T> extends Message<T> {}
export class Deactivate<T> extends Message<T> {}
