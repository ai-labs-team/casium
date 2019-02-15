import { flatten, identity, is, map, merge, nthArg, pipe, splitEvery, when } from 'ramda';

import { Empty, GenericObject, InternalResult, mapResult, reduceUpdater, Updater } from './internal/container';
import { Command, Constructor } from './message';

/**
 * Helper function for sequencing multiple updaters together using left-to-right composition.
 * Each subsequent updater will receive the model returned by the preceding updater, and command messages
 * returned will be aggregated across all updaters.
 *
 * Improves container refactoring by allowing you to extract and recompose shared logic.
 */
export function seq<Model, MsgData>(...updaters: Updater<Model, MsgData>[]) {
  return function (model: Model, msg: MsgData, relay: GenericObject = {}): InternalResult<Model> {
    const merge = (
      [{}, cmds]: InternalResult<Model>,
      [newModel, newCmds]: InternalResult<Model>
    ): InternalResult<Model> => [
      newModel,
      flatten(cmds.concat(newCmds))
    ];

    const reduce = (prev: InternalResult<Model>, cur: Updater<Model, MsgData>) => merge(prev, mapResult(
      reduceUpdater(cur, prev[0], msg, relay)
    ));

    return updaters.reduce(reduce, [model, []]);
  };
}

export type ModelMapper<Model, MsgData> = (Updater<Model, MsgData> | {
  [K in keyof Model]: (model: Model, msg?: MsgData, relay?: GenericObject) => Model[K]
});

/**
 * Accepts a mapper that transforms a model. The mapper can be an updater, or an object that pairs
 * keys to updater-signature functions that return a value. The returned values are then paired to the
 * mapper's keys and merged into the model.
 */
export const mapModel = <Model, MsgData>(mapper: ModelMapper<Model, MsgData>) => (
  model: Model,
  msg?: MsgData,
  relay?: GenericObject
): Model => {
  const update = (fn: Updater<Model, MsgData>) => fn(model, msg, relay);
  return merge(model, (
    is(Function, mapper)
      ? update(mapper as Updater<Model, MsgData>)
      : map(update, mapper as any)
  ));
};

export const relay = <Model, MsgData>(fn?: (r: GenericObject) => Updater<Model, MsgData>) => pipe(
  nthArg(2),
  (fn || identity)
);

export const message = <Model, MsgData>(fn?: (m: MsgData) => Updater<Model, MsgData>) => pipe(
  nthArg(1),
  (fn || identity)
);

export const union = <Model, MsgData>(
  fn?: (u: { model: Model, msg: MsgData, relay: GenericObject }) => Updater<Model, MsgData>
) => (model: Model, msg: MsgData, relay: GenericObject) => (fn || identity)({ model, msg, relay });

const mapData = <Model, MsgData>(model: Model, msg: MsgData, relay: GenericObject) => when(
  is(Function),
  fn => fn(model, msg, relay)
);
const consCommands = <Model>(model: Model, msg: GenericObject, relay: GenericObject) => pipe(
  splitEvery(2),
  map(([cmd, data]: any) => cmd && new (cmd as any)(mapData(model, msg, relay)(data)) || null)
);

export type CommandParam<Model, MsgData, CmdData> = (
  Constructor<any, Command<any>> | Empty | GenericObject | UpdateCommandMapper<Model, MsgData, CmdData>
);
export type UpdateCommandMapper<Model, MsgData, CmdData> = (
  model: Model,
  msg: MsgData,
  relay: GenericObject
) => CmdData;

/**
 * Helper function for updaters that only issue commands. Pass in alternating command constructors and
 * command data, i.e.:
 *
 * ```
 * [FooMessage, commands(Storage.Write, { key: 'foo' }, Storage.Delete, { key: 'bar' })]
 * ```
 *
 * Command data arguments can also be functions that return data. These functions have the same type
 * signature as updaters:
 *
 * ```
 * [FooMessage, commands(Http.Post, (model, msg) => ({ url: '/foo', data: [model.someData, msg.otherData] }))]]
 * ```
 *
 * @deprecated See the `command()` function.
 */
export const commands = <Model extends {}, MsgData extends {}>(
  ...args: CommandParam<Model, MsgData, any>[]
): Updater<Model, MsgData> => {
  if (args.length % 2 !== 0) {
    throw new TypeError('commands() must be called with an equal number of command constructors & data parameters');
  }
  return (model, msg?, relay?) => [model, consCommands(model, msg, relay)(args)];
};

/**
 * Helper function for updaters that issue commands. Pass in a command constructor and
 * command data, i.e.:
 *
 * ```
 * [FooMessage, command(Storage.Write, { key: 'foo' })]
 * ```
 *
 * Command data arguments can also be functions that return data. These functions have the same type
 * signature as updaters:
 *
 * ```
 * [FooMessage, command(Http.Post, (model, msg) => ({ url: '/foo', data: [model.someData, msg.otherData] }))]]
 * ```
 *
 * To sequence multiple commands together, use the `seq()` helper function:
 *
 * ```
 * [FooMessage, seq(
 *   command(Storage.Write, { key: 'foo' }),
 *   command(Storage.Delete, { key: 'bar' })
 * )]
 * ```
 */
export const command = <Model, MsgData, CmdData>(
  cmd: Constructor<CmdData, Command<CmdData>> | Empty,
  data: CmdData | UpdateCommandMapper<Model, MsgData, CmdData>
) => (
  (model: Model, msg: MsgData, relay: GenericObject) => [model, cmd && new cmd(mapData(model, msg, relay)(data))]
);
