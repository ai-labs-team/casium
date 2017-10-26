import { either as or, is, isNil } from 'ramda';
import Message from '../message';
import { isEmittable } from '../util';

/**
* Read checks that its input is an object and that it has no invalid types
**/
export class Read extends Message {
  public static expects = { key: is(String), result: isEmittable };
}

/**
* Write checks for an object input with key and value props of valid type (required) as
* well as path and expiration (optional)
**/

export class Write extends Message {
  public static expects = {
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
  public static expects = { key: is(String) };
}
