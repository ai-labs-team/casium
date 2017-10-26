import { complement as not, is, isNil } from 'ramda';
import Message from '../message';
import { isEmittable } from '../util';

/**
* These classes are used to handle the specified interactions with local storage.
**/

export class Read extends Message {
  public static expects = { key: is(String), result: isEmittable };
}

export class Write extends Message {
  public static expects = { key: is(String), value: not(isNil) };
}

export class Delete extends Message {
  public static expects = { key: is(String) };
}

export class Clear extends Message {
  public static expects = {};
}
