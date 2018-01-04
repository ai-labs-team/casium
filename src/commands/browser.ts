import { is } from 'ramda';
import Message from '../message';

export class ReplaceHistory extends Message {
  public static expects = { path: is(String) };
}

export class PushHistory extends Message {
  public static expects = { path: is(String) };
}

export class Back extends Message {
}

export class Timeout extends Message {
  public static expects = { result: Message.isEmittable, timeout: is(Number) };
}
