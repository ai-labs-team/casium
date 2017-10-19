import {
	pipe,
	curry,
	evolve,
	is,
	pickAll,
	keys,
	all,
	merge as _merge,
	values,
	both,
	propEq,
	ifElse,
	identity,
	reduce,
	mergeDeepWith,
	union,
	map,
	flip,
	filter,
	not,
	isEmpty,
	nth,
	zipWith,
	equals,
	either as or,
	both as and
} from 'ramda';
import React, { Children } from 'react';
import Message from './message';

/**
 * Deep-merges two objects, overwriting left-hand keys with right-hand keys, unionizing arrays.
 *
 * @param  {Object} left
 * @param  {Object} right 
 * @return {Object}
 */
export const merge = mergeDeepWith(
	(left, right) => (all(is(Array), [left, right]) ? union(left, right) : right)
);

/**
 * Convenience function for handlers that only update state with fixed values,
 * i.e. `[FooMessage, state => merge(state, { bar: true })]` becomes
 * `[FooMessage, update({ bar: true })]`
 */
export const update = flip(_merge);

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
 * getValidationFailures({ foo: is(String), bar: is(Function) })({ foo: "Hello", bar: "not Func" }) -> ["bar"]
 * ```
 */
export const getValidationFailures = spec =>
	pipe(pickAll(keys(spec)), evolve(spec), filter(not), keys);

const isFunctionWithNumArgs = numArgs => both(is(Function), propEq('length', numArgs));

const isObjectAndAllValuesAreFunctions = both(is(Object), pipe(values, all(is(Function))));

const assertValid = (fnMap, component) => {
	const spec = { fnMap: isObjectAndAllValuesAreFunctions, component: isFunctionWithNumArgs(1) };
	const failures = getValidationFailures(spec)({ fnMap, component });

	if (!isEmpty(failures)) {
		throw new TypeError('withProps failed on types: ' + failures.join(', '));
	}
};

/**
 * Accepts an object of key/function pairs and a pure component function, and returns
 * a new pure component that will generate and inject new props into the pass component
 * function.
 * @param  {Object<Function>} fnMap - An object hash of functions used to generate new props
 * @param  {Component} component - A pure function that returns React DOM
 * @params {Object} props - Accepts props passed from parent
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
export const withProps = curry((fnMap, component, props) => {
	assertValid(fnMap, component, props);
	return component(merge(props, map(fn => fn(props), fnMap)));
});

/**
* Merges new props into each child from a children array and also into nested children arrays
*
* @params {Array{}} children - array of children elements
* @params {Object} newProps
* @return array of children objects, each with additional newProps
**/

export const cloneRecursive = (children, newProps) =>
	Children.map(children, child => {
		const mapProps = child => {
			const props = is(Function, newProps) ? newProps(child) : newProps;
			const hasChildren = child.props && child.props.children;
			const mapper = hasChildren && is(Array, child.props.children) ? identity : nth(0);
			const children = hasChildren ? mapper(cloneRecursive(child.props.children, newProps)) : null;
			return merge(props || {}, { children });
		};

		return React.isValidElement(child) ? React.cloneElement(child, mapProps(child)) : child;
	});

/**
* Merges new props into each child from a children array
*
* @params {Array{}} children - array of children elements
* @params {Object} newProps
* @return array of children objects, each with additional newProps
**/

export const clone = (children, newProps) =>
	Children.map(children, child =>
		React.cloneElement(
			child,
			merge(React.isValidElement(child) ? newProps : {}, {
				children: child.props.children
			})
		)
	);

/**
* prevents default action of events then returns the event object
**/

export const suppressEvent = e => {
	e.preventDefault();
	return e;
};

/**
 * Logs a value with a message and returns the value. Good for inspecting complex
 * function pipelines.
 */
export const log = curry((msg, val) => {
	console.log(msg, val); // eslint-disable-line no-console
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
export const trap = curry((handler, fn) => (...args) => {
	try {
		return fn(...args);
	} catch (e) {
		return handler(e, ...args);
	}
});

/**
 * Converts a value to an array... unless it's already an array, then it just returns it.
 * @type {[type]}
 */
export const toArray = ifElse(is(Array), identity, Array.of);

/**
 * Helper functions for reducing effect Maps into a single Map.
 */
export const mergeMap = (first, second) => new Map([...first, ...second]);
export const mergeMaps = reduce(mergeMap, new Map([]));

/**
 * Safely stringifies a JavaScript value to prevent error-ception in `app.result()`.
 */
export const safeStringify = val => {
	try {
		return JSON.stringify(val);
	} catch (e) {
		return '{ unrepresentable value }';
	}
};

/**
 * Safely parses a JavaScript value to prevent error-ception.
 */
export const safeParse = val => {
	try {
		return JSON.parse(val);
	} catch (e) {
		return undefined;
	}
};

/**
 * Checks that a value is a message constructor.
 */
export const isMessage = result =>
	result && result.prototype && result.prototype instanceof Message;

/**
 * Checks that a value is emittable as a message constructor
 */
export const isEmittable = or(isMessage, and(is(Array), pipe(nth(0), isMessage)));

/**
  * checks if a value is an array, if so then it is returned, if not it gets placed in an array
  **/

export const toEmittable = ifElse(is(Array), identity, type => [type, {}]);

/**
 * Maps an emittable and message data to a message.
 */
export const constructMessage = curry((msgType, data) => {
	const [type, extra] = toEmittable(msgType);
	return new type(merge(data, extra));
});
