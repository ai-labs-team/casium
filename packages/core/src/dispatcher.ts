import { always, cond, curry, flip, is, pipe, prop, T } from 'ramda';
import { Command, Constructor } from './message';
import ExecContext from './runtime/exec_context';
import { EffectType, ProcessState } from './subscription';
import { safeStringify } from './util';

export type EffectMap = Map<Constructor<any, Command<any>>, (...args: any[]) => any>;

const unbox = cond([
  [is(Command), pipe(prop('data'), Array.of)],
  [is(ProcessState), Array.of],
  [T, always(null)]
]);

export const handler = curry(<T>(effects: EffectMap, msg: Command<T> | ProcessState) => {
  const key = msg && msg[EffectType] || msg.constructor;
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
export default curry((effects: EffectMap, execContext: ExecContext<any>, msg: Command<any>) => {
  const ctor = msg && msg.constructor, data = unbox(msg), callback = effects.get(handler(effects, msg));

  if (!data) {
    throw new TypeError(`Message '${safeStringify(msg)}' of type '${ctor && ctor.name}' is not acceptable`);
  }
  if (!callback) {
    throw new TypeError(`Unhandled command or subscription message type '${ctor && ctor.name}'`);
  }

  return callback(...unbox(msg), execContext.dispatch, execContext);
});
