import { is, isNil, either as or } from 'ramda';
import { isEmittable } from 'architecture/util';
import Message from '../message';

export class Read extends Message {
  static expects = { key: is(String), result: isEmittable };
}

export class Write extends Message {
  static expects = {
    key: is(String),
    value: or(is(Object), is(String)),
    path: or(is(String), isNil),
    expires: or(is(Date), isNil),
  };
}

export class Delete extends Message {
  static expects = { key: is(String) };
}
