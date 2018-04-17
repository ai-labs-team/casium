import { is } from 'ramda';
import Message from '../message';
import { moduleName } from '../util';

@moduleName('Browser')
export class ReplaceHistory extends Message {
  public static expects = { path: is(String) };
}

@moduleName('Browser')
export class PushHistory extends Message {
  public static expects = { path: is(String) };
}

@moduleName('Browser')
export class Back extends Message {
}

@moduleName('Browser')
export class Timeout extends Message {
  public static expects = { result: Message.isEmittable, timeout: is(Number) };
}
