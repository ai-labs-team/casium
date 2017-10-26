import { is, curry, flip } from 'ramda';
import Message from '../message';

/**
 * Dispatches command messages.
 *
 * @param {Map} effects - A map pairing command message constructors to effects handlers
 * @param {Function} dispatch - A container-bound dispatch function for sending
 *        effect results (where applicable) back to containers
 * @param {Message} msg - A command message to dispatch
 * @return {*} returns the result of calling the effect handler
 */
export default curry((effects, dispatch, msg) => {
  const ctor = msg && msg.constructor;

  if (!is(Message, msg)) {
    throw new Error(`Message of type '${ctor && ctor.name}' is not an instance of Message`);
  }
  const handler = effects.get(ctor) || effects.get(Array.from(effects.keys()).find(flip(is)(msg)));

  if (!handler) {
    throw new Error(`Unhandled command message type '${ctor && ctor.name}'`);
  }
  return handler(msg.data, dispatch);
});
