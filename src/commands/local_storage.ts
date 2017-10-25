import { complement as not, is, isNil } from 'ramda';
import Message from '../message';
import { isEmittable } from '../util';

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
