import { flatten, identity as id, is, map, merge, nthArg, pipe, splitEvery, when } from 'ramda';
import { Empty, GenericObject, Updater, UpdateResult } from './core';
import { MessageConstructor } from './message';
import { mapResult, reduceUpdater } from './util';

/**
 * Helper function for sequencing multiple updaters together using left-to-right composition.
 * Each subsequent updater will receive the model returned by the preceding updater, and command messages
 * returned will be aggregated across all updaters. If any updater returns a function, that function
 * will be treated as an updater.
 */
export function seq<Model>(...updaters: Updater<Model>[]) {
  return function (model: Model, msg: GenericObject = {}, relay: GenericObject = {}): UpdateResult<Model> {
    const merge = ([{ }, cmds], [newModel, newCmds]) => [newModel, flatten(cmds.concat(newCmds))];
    const reduce = (prev, cur) =>
      merge(prev, mapResult(reduceUpdater(cur, prev[0], msg, relay)));

    return updaters.reduce(reduce, [model, []]) as UpdateResult<Model>;
  };
}

export type ModelMapperFn<M> = (model: M, message?: GenericObject, relay?: GenericObject) => M;
export type ModelMapper<M> = ModelMapperFn<M> | { [key: string]: ModelMapperFn<M> };

/**
 * Accepts a mapper that transforms a model. The mapper can be an updater, or an object that pairs
 * keys to updater-signature functions that return a value. The returned values are then paired to the
 * mapper's keys and merged into the model.
 */
export const mapModel = <M>(mapper: ModelMapper<M>) =>
  (model: M, message?: GenericObject, relay?: GenericObject): UpdateResult<M> => {
    const update = fn => fn(model, message, relay);
    return merge(model, is(Function, mapper) ? update(mapper) : map(update, mapper));
  };

export const relay = <M>(fn?: (r: any) => UpdateResult<M>) => pipe(nthArg(2), (fn || id));
export const message = <M>(fn?: (m: any) => UpdateResult<M>) => pipe(nthArg(1), (fn || id));
export const union = <M>(fn?: (u: { model: M, message?: GenericObject, relay?: GenericObject }) => UpdateResult<M>) =>
  (model: M, message = {}, relay = {}) => (fn || id)({ model, message, relay });

const mapData = (model, msg, relay) => when(is(Function), fn => fn(model, msg, relay));

const consCommands = (model, msg, relay) => pipe(
  splitEvery(2),
  map(([cmd, data]) => cmd && new (cmd as any)(mapData(model, msg, relay)(data)) || null)
);

export type CommandParam<M> = MessageConstructor<any> | Empty | GenericObject | UpdateCommandMapperDep<M>;
export type UpdateCommandMapperDep<M> = (model: M, message: GenericObject, relay: GenericObject) => GenericObject;

/**
 * @deprecated
 */
export const commands = <M>(...args: CommandParam<M>[]): Updater<M> => {
  if (args.length % 2 !== 0) {
    throw new TypeError('commands() must be called with an equal number of command constructors & data parameters');
  }
  return (model, msg?, relay?) => [model, consCommands(model, msg, relay)(args)];
};

export type UpdateCommandMapper<Model, CmdData> = (
  model: Model,
  message: GenericObject,
  relay: GenericObject
) => CmdData;

/**
 * Helper function for updaters that only issue commands. Pass a command constructor and
 * command data, i.e.:
 *
 * ```
 * [FooMessage, command(LocalStorage.Write, { key: 'foo', value: 'bar' })]
 * ```
 *
 * Command data arguments can also be functions that return data. These functions have the same
 * parameter type signature as updaters:
 *
 * ```
 * [FooMessage, command(Http.Post, (model, msg) => ({ url: '/foo', data: [model.someData, msg.otherData] }))]]
 * ```
 */
export const command = <Model, CmdData>(
  ctor: MessageConstructor<CmdData> | Empty,
  data: CmdData | UpdateCommandMapper<Model, CmdData>
): Updater<Model> => (
  (model: Model, msg?, relay?) => [model, ctor && new ctor(mapData(model, msg, relay)(data)) || null]
);
