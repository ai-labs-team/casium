import { is } from 'ramda';
import Message from '../message';
import { isEmittable } from '../util';

export class ReplaceHistory extends Message {
  static expects = { path: is(String) }
}

export class PushHistory extends Message {
  static expects = { path: is(String) }
}

export class Back extends Message {
}

export class Timeout extends Message {
  static expects = { result: isEmittable, timeout: is(Number) }
}
