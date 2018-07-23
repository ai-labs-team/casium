import * as deepFreeze from 'deep-freeze-strict';
import {
  __, all, always, both, cond, curry, equals, evolve, filter, flip, identity,
  ifElse, is, keys, map, merge, mergeDeepWith, not, nth, pathOr, pickAll, pipe,
  propEq, reduce, union, when, zipWith
} from 'ramda';
import * as React from 'react';

// tslint:disable-next-line:ban-types
export const moduleName = (prefix: string) => (constructor: Function) => {
  Object.defineProperty(constructor, 'name', { value: `${prefix}.${constructor.name}` });
};

/**
 * Deep-merges two objects, overwriting left-hand keys with right-hand keys, unionizing arrays.
 *
 * @param  {Object} left
 * @param  {Object} right
 * @return {Object}
 */
export const mergeDeep = mergeDeepWith((left, right) => (
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
export const compareOffsets = curry((a, b) => all(equals(true), zipWith(equals, a, b)));

/**
 * Accepts a validator object where the values are functions that return boolean, and
 * returns a function that accepts an object to check against the validator.
 *
 * @example
 * ```
 * getValidationFailures({ foo: is(String), bar: is(Function) })
 *   ({ foo: "Hello", bar: "not Func" }) -> ["bar"]
 * ```
 */
export const getValidationFailures = spec => pipe(
  pickAll(keys(spec)),
  evolve(spec),
  filter(not),
  keys
);

/**
 * Accepts an object of key/function pairs and a pure component function, and returns
 * a new pure component that will generate and inject new props into the pass component
 * function.
 * @param  {Object<Function>} An object hash of functions used to generate new props
 * @param  {Component} A pure function that returns React DOM
 * @params {Object} Accepts props passed from parent
 * @return {Component} Returns a new component that generates new props from passed props
 *
 * @example
 * ```
 * const FullName = (props) => (<span>{props.fullName}</span>);
 *
 * const Name = withProps(
 *   {
 *     fullName: (props) => `${props.first} ${props.last}`
 *   },
 *   FullName
 * );
 *
 * <Name first="Bob" last="Loblaw" />
 * ```
 */
 export type PropMap<Input, Generated> = {
   [K in keyof Generated]: (props: Input) => Generated[K]
 };
 type withProps<Input extends {}, Generated extends {}> = (
   input: PropMap<Input, Generated>,
   component: React.StatelessComponent<Input & Generated>
 ) => React.StatelessComponent<Input>;
export const withProps = curry((
  fnMap: { [key: string]: (props: object) => any },
  component: React.StatelessComponent<any>,
  props: object
): JSX.Element => component(mergeDeep(props, map(fn => fn(props), fnMap))));

export const cloneRecursive = (children, newProps) => React.Children.map(children, (child) => {
  const mapProps = (child) => {
    const props = is(Function, newProps) ? newProps(child) : newProps;
    const hasChildren = child.props && child.props.children;
    const mapper = hasChildren && is(Array, child.props.children) ? identity : nth(0);
    const children = hasChildren ? mapper(cloneRecursive(child.props.children, newProps)) : null;
    return mergeDeep(props || {}, { children });
  };
  return React.isValidElement(child) ? React.cloneElement(child, mapProps(child)) : child;
});

export const clone = (children, newProps) => React.Children.map(children, (child: React.ReactElement<any>) => (
  React.cloneElement(child, mergeDeep(React.isValidElement(child) ? newProps : {}, {
    children: child.props.children,
  }))
));

export const suppressEvent = (e) => {
  e.preventDefault();
  return e;
};

/**
 * Logs a value with a message and returns the value. Good for inspecting complex
 * function pipelines.
 */
/* istanbul ignore next */
export const log = curry((msg, val, ...extra) => {
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

export const trap: Trap = curry((handler, fn) => ((...args) => {
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
  [both(is(Array), propEq('length', 1)), ([state]) => [freezeObj(state), []]],
  [is(Array), ([state, ...commands]) => [freezeObj(state), commands]],
  [is(Object), state => [freezeObj(state), []]],
  [always(true), (val) => { throw new TypeError('Unrecognized structure ' + safeStringify(val)); }],
]);

export const reduceUpdater = (value, state, msg, relay) =>
  is(Function, value)
    ? reduceUpdater(value(state, msg, relay), state, msg, relay)
    : value;

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
