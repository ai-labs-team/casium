import { curry } from 'ramda';

interface WithDefault {
  <T>(val: T, maybe: Maybe<T>): T;
  <T>(val: T): (maybe: Maybe<T>) => T;
}

// FE ordering is at odds with IS ordering
// tslint:disable member-ordering
export default class Maybe<T> {

  public static empty: Maybe<null> = Maybe.of(null);

  public static defaultToLazy: WithDefault = curry((fn, maybe) => maybe.defaultToLazy(fn));

  public static defaultTo: WithDefault = curry((val, maybe) => maybe.defaultTo(val));

  public static orLazy: WithDefault = curry((fn, maybe) => maybe.orLazy(fn));

  public static or: WithDefault = curry((val, maybe) => maybe.or(val));

  public static isNothing: <T>(m: Maybe<T>) => boolean = maybe => maybe.isNothing();

  public static value: <T>(m: Maybe<T>) => T = maybe => maybe.value();

  public static of<T>(val: T): Maybe<T> { // tslint:disable-line:function-name
    return new Maybe(val);
  }

  private val: T;

  constructor(val: T | null | undefined) {
    Object.freeze(Object.assign(this, { val }));
  }

  public map<U>(fn: (val: T) => U): Maybe<U> {
    return Maybe.of(this.isNothing() ? null : fn(this.val));
  }

  public isNothing(): boolean {
    return (this.val === null || this.val === undefined);
  }

  public value(): T {
    return this.val;
  }

  public chain<U>(fn: (val: T) => Maybe<U>): Maybe<U> {
    return this.isNothing() ? Maybe.empty : fn(this.val);
  }

  public defaultTo(defaultVal: T): T {
    return this.isNothing() ? defaultVal : this.val;
  }

  public defaultToLazy(fn: () => T): T {
    return this.isNothing() ? fn() : this.val;
  }

  public or(alt: Maybe<T>): Maybe<T> {
    return this.isNothing() ? alt : this;
  }

  public orLazy(fn: () => Maybe<T>): Maybe<T> {
    return this.isNothing() ? fn() : this;
  }
}
