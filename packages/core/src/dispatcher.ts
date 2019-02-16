import { always, cond, curry, flip, identity, is, prop } from 'ramda';
import { Command, Constructor } from './message';
import ExecContext from './runtime/exec_context';
import { EffectType, ProcessState } from './subscription';
import { safeStringify } from './util';

type Callback = (...args: any[]) => any;
export type EffectMap = Map<Constructor<any, Command<any>>, Callback>;

const unbox = cond([
  [is(Command), prop('data')],
  [is(ProcessState), identity],
  [always(true), always(null)]
]);

export const handler = curry<EffectMap, Command<any> | ProcessState, any>(
  (effects: EffectMap, cmd: Command<any> | ProcessState) => {
    const key: Constructor<any, Command<any>> = cmd && (cmd as any)[EffectType] || cmd.constructor;
    return effects.get(key) && key || Array.from(effects.keys()).find(flip(is)(cmd));
  }
);

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

  return callback(...Array.of(unbox(msg)), execContext.dispatch, execContext);
});
