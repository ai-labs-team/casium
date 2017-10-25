import { is, isNil, either as or } from 'ramda';
import { isEmittable } from '../util';
import Message from '../message';

export class Read extends Message {
  static expects = { key: is(String), result: isEmittable };
}

export class Write extends Message {
  static expects = {
    expires: or(is(Date), isNil),
    key: is(String),
    path: or(is(String), isNil),
    value: or(is(Object), is(String))
  };
}

export class Delete extends Message {
  static expects = { key: is(String) };
}
