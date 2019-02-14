import deepFreeze from 'deep-freeze-strict';
import {
  __, all, always, both, cond, curry, equals, flip, identity, ifElse, is, merge, mergeDeepWith,
  pathOr, propEq, reduce, union, when, zipWith
} from 'ramda';
import { GenericObject, Result } from './core';
import { Constructor } from './message';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const moduleName = (prefix: string) => <T extends Constructor<any, any>>(constructor: T) => {
  Object.defineProperty(constructor, 'name', { value: `${prefix}.${constructor.name}` });
};

/**
 * Deep-merges two objects, overwriting left-hand keys with right-hand keys, unionizing arrays.
 *
 * @param  {Object} left
 * @param  {Object} right
 * @return {Object}
 * @deprecated
 */
export const mergeDeep = mergeDeepWith((left: object | any[], right: object | any[]) => (
  all(is(Array), [left, right]) ? union(left, right) : right
));

/**
 * Convenience function for handlers that only update state with fixed values,
 * i.e. `[FooMessage, state => merge(state, { bar: true })]` becomes
 * `[FooMessage, replace({ bar: true })]`
 */
export const replace = flip(merge);

/**
 * Returns the count of offsets that are equal between two arrays. Useful for determining
 * if one array is the prefix of another, i.e.:
 *
 * ```
 * compareOffsets([1,2,3], [1,2,3,4,5]) -> true
 * compareOffsets([1,2,3,5], [1,2,3,4,5]) -> false
 * ```
 *
 * @param  {Array} a 'Prefix' array
 * @param  {Array} b Array to compare against
 * @return {Boolean} Returns true if `a` is the prefix of `b`.
 */
export const compareOffsets = curry((a: any[], b: any[]) => all(equals(true), zipWith(equals, a, b)));

export const suppressEvent = (e: { preventDefault: () => void }) => {
  e.preventDefault();
  return e;
};

/**
 * Logs a value with a message and returns the value. Good for inspecting complex
 * function pipelines.
 */
/* istanbul ignore next */
export const log = curry((msg: any, val: any, ...extra: any[]) => {
  // tslint:disable-next-line:no-console
  console.log(msg, val, ...extra);
  return val;
});

/**
 * Provides a functional interface for catching and handling errors.
 *
 * @param  {Function} handler A handler function to call when an error is thrown.
 * @param  {Function} fn A function to trap errors on.
 * @return {Function} Returns a function that, when called, passes its arguments to the
 *                    wrapped function. If the call succeeds, the it returns the result
 *                    of calling the wrapped function, otherwise returns the result of
 *                    passing the error (along with the arguments) to the handler.
 */
export type Trap = <T, U>(handler: (...args: any[]) => T, fn: (...args: any[]) => U) => (...args: any[]) => T | U;

export const trap: Trap = curry(<T, U>(
  handler: (...args: any[]) => T,
  fn: (...args: any[]) => U
) => ((...args: any[]) => {
  try {
    return fn(...args);
  } catch (e) {
    return handler(e, ...args);
  }
}));

/**
 * Converts a value to an array... unless it's already an array, then it just returns it.
 */
export const toArray = ifElse(is(Array), identity, Array.of);

/**
 * Helper functions for reducing effect Maps into a single Map.
 */
export const mergeMap = <T, U>(first: Map<T, U>, second: Map<T, U>): Map<T, U> =>
  new Map(Array.from(first).concat(Array.from(second) as [T, U][]));
export const mergeMaps = reduce(mergeMap, new Map([]));

/**
 * Safely stringifies a JavaScript value to prevent error-ception.
 */
export const safeStringify = (val: any): string => {
  try {
    return JSON.stringify(val);
  } catch (e) {
    return '{ unrepresentable value }';
  }
};

/**
 * Safely parses a JavaScript value to prevent error-ception.
 */
export const safeParse = (val: string): any | undefined => {
  try {
    return JSON.parse(val);
  } catch (e) {
    return undefined;
  }
};

/**
 * Freezes a value if that value is an object, otherwise return.
 */
const freezeObj = when(is(Object), deepFreeze);

/**
 * Maps an `init()` or `update()` return value to the proper format.
 */
export const mapResult = cond([
  [both(is(Array), propEq('length', 0)), () => { throw new TypeError('An empty array is an invalid value'); }],
  [both(is(Array), propEq('length', 1)), ([model]: [object]) => [freezeObj(model), []]],
  [is(Array), ([model, ...commands]: any) => [freezeObj(model), commands]],
  [is(Object), (model: any) => [freezeObj(model), []]],
  [always(true), (val: any) => { throw new TypeError(`Unrecognized update structure ${safeStringify(val)}`); }],
]);

export const reduceUpdater = <Model>(
  value: any,
  model: Model,
  msg: GenericObject,
  relay: GenericObject
): Result<Model> => is(Function, value) ? reduceUpdater(value(model, msg, relay), model, msg, relay) : value;

/**
 * Generic helper function for resolving the `name` of an Instance's Constructor
 * function
 */
const ctorName = pathOr(__, ['constructor', 'name']);

/**
 * Gets the `name` of a Message instance, or defaults to `{INIT}` for nameless
 * Messages (ie, those called during container initialization)
 */
export const msgName = ctorName('{INIT}');

/**
 * Gets the `name` of a Command Message instance. A nameless Command Message
 * typically indicates an error.
 */
export const cmdName = ctorName('??');

/**
 * Gets the `name` of a Container if it exists, or defaults to `{Anonymous
 * Container}` in cases where an explicit name has not been given.
 */
export const contextContainerName = pathOr('{Anonymous Container}', ['container', 'name']);
