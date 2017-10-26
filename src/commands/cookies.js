import { is, isNil, either as or } from 'ramda';
import { isEmittable } from '../util';
import Message from '../message';

/**
* Read checks that its input is an object and that it has no invalid types
**/
export class Read extends Message {
  static expects = { key: is(String), result: isEmittable };
}

/**
* Write checks for an object input with key and value props of valid type (required) as
* well as path and expiration (optional)
**/

export class Write extends Message {
  static expects = {
    expires: or(is(Date), isNil),
    key: is(String),
    path: or(is(String), isNil),
    value: or(is(Object), is(String))
  };
}

/**
* Delete checks for an object input with a key and value pair with valid types
**/

export class Delete extends Message {
  static expects = { key: is(String) };
}
