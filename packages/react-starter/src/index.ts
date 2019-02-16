import { Container, ContainerDef, withEnvironment } from '@casium/core';
import dispatcher from '@casium/core/dispatcher';
import { create, Environment } from '@casium/core/environment';
import { renderer } from '@casium/react';

import effects from './effects';

export * from '@casium/core';
export { default as Message } from '@casium/core/message';
export { isolate } from '@casium/react';

export const root: Environment = create({
  effects,
  dispatcher,
  renderer
});

/**
 * Creates a new container.
 *
 * @param  {Object} An object with the following functions:
 *         - `init`: Returns an update result, representing the initial value of the container's model.
 *           See "Update Results" below for details.
 *         - `update`: A function that accepts the current model as an object,
 *            and returns a `Map` pairing message types to handler functions.
 *            Each handler function accepts the message's data as a parameter,
 *            returns an update result. See "Update Results" below for details.
 *         - `view`: A pure component (i.e. a function that returns React DOM) — as part of
 *           its props, the component will receive an `emit` function, which can be called
 *           with a user-defined message class.
 *         - `attach`: Optional. If attaching to a Redux store, pass `store` and (optionally) `key`. The
 *           container will then subscribe to the store and propagate changes. Remember to call `reducer()`
 *           on the container and pass the resulting value to `combineReducers()` to complete the loop.
 *
 * ### Update Results
 *
 * An update result is a value returned from dispatching a message. Update results are used
 * to update the containers's model, as well as return _command messages_, which represent
 * side-effects that the container can perform, such as an HTTP request.
 *
 * Update results can be one of the following:
 *
 * - An object: to update the model without performing any actions — at a minimum, the
 *   current model must always be returned
 * - An array of `[model, message]`: to update the model _and_ perform an action, return an array
 *   with the model first, and a message object second,
 *   i.e. `[model, new Alert({ message: "Hello world!" })]`
 * - An array of `[model, [message]]`: to perform multiple actions, simply return an array of
 *   command messages
 *
 * @return {Object} returns an object with the following methods:
 *
 *  - `dispatch`: Accepts a message object to update the container's model
 *  - `state`: Returns the current model
 *  - `view`: A React wrapper component that can be rendered or embedded
 *    in another component
 *  - `reducer`: Returns a Redux-compatible reducer function. Optionally accepts a hash
 *    pairing action types to message types, to enable the container to respond to Redux actions,
 *    which will be mapped to messages.
 *  - `push`: Accepts a new model value to update the container.
 *  - `subscribe`: Accepts a callback which receives a copy of the model when it is updated.
 *  - `identity`: Returns an object containing the original values that created this container.
 *  - `accepts`: Accepts a message class and returns a boolean indicating whether the container
 *    accepts messages of that type.
 */
export const container: <M>(def: ContainerDef<M>) => Container<M> = withEnvironment(root);
