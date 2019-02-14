import { both, complement as not, curry, either as or, filter, is, nth, pipe, prop, values } from 'ramda';
import Message, { Command, Constructor } from '../message';
import { cmdName } from '../util';
import ExecContext from './exec_context';

type Check = 'emit' | 'cmd' | 'dispatch' | 'msg';

/**
 * Walk up a container hierarchy looking for a value.
 *
 * @param  {Function} Callback to check an execution context for a value
 * @param  {Object} The starting (child) execution context to walk up from
 * @param  {*} args Arguments to pass to `cb`
 * @return {*}
 */
const walk = curry((cb, exec, val) => cb(exec, val) || exec.parent && walk(cb, exec.parent, val));

/**
 * Checks that a value is a `Message` constructor.
 */
const isMessage = val => val && val.prototype && val.prototype instanceof Message;

/**
 * Checks that a value is emittable as a message constructor or equivalent
 */
const isEmittable = or(isMessage, both(is(Array), pipe(nth(0), isMessage)));

/**
 * Checks if the container or container's ancestor handles messages of a given type
 *
 * @param  msgType A message constructor
 * @return Returns true if the container (or an ancestor) has an update handler matching
 *         the given constructor, otherwise false.
 */
const handles = <T>(exec: ExecContext<any>) => (
  walk((exec, type) => exec.container.accepts(type), exec) as (msgType: Constructor<T, Message<T>>) => boolean
);

const validators: { [key in Check]: any } = {

  /**
   * Maps a state & a message to a new model and optional command (or list of commands).
   */
  msg: <T>({ updater, msg }: { updater: any, msg: Message<T> }) => {
    if (!is(Message, msg)) {
      const ctor = msg && msg.constructor && msg.constructor.name || '{Unknown}';
      throw new TypeError(`Message of type '${ctor}' is not an instance of Message`);
    }
    if (!updater || !is(Function, updater)) {
      throw new TypeError(`Invalid update handler for message type '${msg.constructor.name}'`);
    }
  },

  dispatch: <T>({ msg, exec }) => {
    const msgType = msg.constructor as Constructor<T, Message<T>>;

    if ((msgType as any) === Function) {
      throw new TypeError(`Attempted to dispatch message constructor '${(msg as any).name}' — should be an instance`);
    }

    if (!handles(exec)(msgType)) {
      throw new TypeError(`Unhandled message type '${msgType.name}' in container '${exec.container.name}'`);
    }
  },

  emit: ({ msgCtor, exec }) => {
    if (!handles(exec)(msgCtor)) {
      throw new Error(
        `Messages of type '${msgCtor && msgCtor.name || '??'}' ` +
        `are not handled by container '${exec.container.name}' or any of its ancestors`
      );
    }
  },

  /**
   * Checks that a command's response messages (i.e. `result`, `error`, etc.) are handled by a container.
   */
  cmd: <M, T>({ exec, cmd }: { exec: ExecContext<M>, cmd: Message<T> }) => {
    const unhandled = pipe(prop('data'), values, filter(isEmittable), filter(not(handles(exec))));
    const msgs = unhandled(cmd);

    if (msgs.length) {
      throw new Error([
        `A ${cmdName(cmd)} command was sent from container ${exec.container.name} `,
        'with one or more result messages that are unhandled by the container (or its ancestors): ',
        msgs.map(prop('name')).join(', '),
      ].join(''));
    }
  }
};

/**
 * Public interface for checking a message against a validator. If validation fails, an error
 * containing the details of the problem will be throw. Keys for the second parameter vary by
 * what type of validation is being done.
 *
 * @return void
 */
export default (type: Check, data: {
  exec?: ExecContext<any>,
  updater?: (...args: any[]) => any,
  cmd?: Command<any>,
  msgCtor?: Constructor<any, Message<any>>,
  msg?: Message<any>
}) => validators[type] && validators[type](data);
