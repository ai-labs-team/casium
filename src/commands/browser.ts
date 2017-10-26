import { is } from 'ramda';
import Message from '../message';
import { isEmittable } from '../util';

/**
* PushHistory, ReplaceHistory, and Back classes manage the browser history.
* Additionally, PushHistory and ReplaceHistory check if the path is a string
**/

export class ReplaceHistory extends Message {
  public static expects = { path: is(String) };
}

export class PushHistory extends Message {
  public static expects = { path: is(String) };
}

export class Back extends Message {}

/**
* Timout adds browser timeout functionality and verifies timout is a number
**/

export class Timeout extends Message {
  public static expects = { result: isEmittable, timeout: is(Number) };
}
