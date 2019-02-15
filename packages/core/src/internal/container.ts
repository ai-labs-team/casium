import deepFreeze from 'deep-freeze-strict';
import { __, always, both, cond, flatten, identity, is, pathOr, propEq, when } from 'ramda';

import Message, { Command, Constructor } from '../message';
import * as Redux from '../runtime/redux';
import { Path } from '../runtime/state_manager';
import { Omit, safeStringify } from '../util';

export type Empty = false | null | undefined;
export type CommandOrEmpty = Command<any> | Empty;

export type InternalResult<Model> = [Model, Command<any>[]];

export type GenericObject = { [key: string]: any };

export type Result<Model> = (
  Model |
  [Model, ...CommandOrEmpty[]] |
  [Model, ...CommandOrEmpty[][]] |
  InternalResult<Model>
);
export type BaseUpdater<Model, MsgData> = (model: Model, msg?: MsgData, relay?: GenericObject) => Result<Model>;
export type Updater<Model, MsgData> = (
  (BaseUpdater<Model, MsgData>) |
  ((model: Model, msg?: MsgData, relay?: GenericObject) => Updater<Model, MsgData>)
);

export type Delegate = typeof PARENT | string | Path;
export type UpdaterPair<Model, MsgData> = [Constructor<MsgData, Message<MsgData>>, Updater<Model, MsgData>];
export type UpdateMap<Model, MsgData> = Map<Constructor<MsgData, Message<MsgData>>, Updater<Model, MsgData>>;

export type Emitter = <MsgData>(
  msg: Constructor<MsgData, Message<MsgData>> | [Constructor<MsgData, Message<MsgData>>, Partial<MsgData>]
) => (e: any) => void;

export type ContainerView<Model> = (props: Model & {
  emit: Emitter,
  relay: GenericObject
}) => any;

export type ExternalInterface<Model> = {
  accepts: (m: Constructor<any, Message<any>>) => boolean;
  identity: () => ContainerDef<Model>;
};

export type ContainerDef<Model> = {
  name: string;
  delegate?: Delegate;
  init: (model: Model, relay: GenericObject) => Result<Model>;
  relay?: { [key: string]: <RelayValue>(model: Model, relay: GenericObject) => RelayValue };
  subscriptions?: (model: Model, relay: GenericObject) => CommandOrEmpty | CommandOrEmpty[];
  update: UpdaterPair<Model, any>[];
  view: ContainerView<Model>;
  attach?: Redux.Config;
};

export type InternalContainerDef<Model> = Omit<ContainerDef<Model>, 'update'> & {
  update: UpdateMap<Model, any>
};

/**
 *  A global symbol that allows users to opt into what is currently the default delegate behavior
 *  i.e when a delegate is unspecified, the container is hoisted into it's parent state
 */
export const PARENT = Symbol.for('@delegate/parent');

/**
 * Freezes a value if that value is an object, otherwise return.
 */
const freezeObj = when(is(Object), deepFreeze);

/**
 * Maps an `init()` or `update()` return value to the proper format.
 */
export const mapResult = cond<Result<any>, InternalResult<any>>([
  [both(is(Array), propEq('length', 0)), () => { throw new TypeError('An empty array is an invalid value'); }],
  [both(is(Array), propEq('length', 1)), ([model]: [object]) => [freezeObj(model), []]],
  [is(Array), ([model, ...commands]: any) => [freezeObj(model), flatten(commands).filter(identity)]],
  [is(Object), (model: any) => [freezeObj(model), []]],
  [always(true), (val: any) => { throw new TypeError(`Unrecognized update structure ${safeStringify(val)}`); }],
]);

export const reduceUpdater = <Model>(
  value: any,
  model: Model,
  msg: GenericObject,
  relay: GenericObject
): Result<Model> => is(Function, value) ? reduceUpdater(value(model, msg, relay), model, msg, relay) : value;

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
