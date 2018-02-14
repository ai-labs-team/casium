import { always, cond, curry, flip, is, pipe, prop, T } from 'ramda';
import Message, { MessageConstructor } from './message';
import StateManager from './runtime/state_manager';
import { EffectType, ProcessState } from './subscription';
import { safeStringify } from './util';

export type EffectMap = Map<MessageConstructor, (...args: any[]) => any>;

const unbox = cond([
  [is(Message), pipe(prop('data'), Array.of)],
  [is(ProcessState), Array.of],
  [T, always(null)]
]);

export const handler = curry((effects: EffectMap, msg: Message) => {
  const key = msg && msg[EffectType] || (msg.constructor as MessageConstructor);
  return effects.get(key) && key || Array.from(effects.keys()).find(flip(is)(msg));
});

/**
 * Dispatches command messages.
 *
 * @param {Map} A map pairing command message constructors to effects handlers
 * @param {Function} dispatch A container-bound dispatch function for sending
 *        effect results (where applicable) back to containers
 * @param {Message} msg A command message to dispatch
 * @return {*} returns the result of calling the effect handler
 */
export default curry((effects: EffectMap, stateManager: StateManager, dispatch, msg: Message) => {
  const ctor = msg && msg.constructor, data = unbox(msg), callback = effects.get(handler(effects, msg));

  if (!data) {
    throw new Error(`Message '${safeStringify(msg)}' of type '${ctor && ctor.name}' is not acceptable`);
  }
  if (!callback) {
    throw new Error(`Unhandled command or subscription message type '${ctor && ctor.name}'`);
  }

  return callback(...unbox(msg), dispatch, stateManager);
});
