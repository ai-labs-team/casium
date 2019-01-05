import { either as or, is, isNil } from 'ramda';
import Message from '../message';
import { moduleName } from '../util';

@moduleName('Cookies')
export class Read extends Message {
  public static expects = { key: is(String), result: Message.isEmittable };
}

@moduleName('Cookies')
export class Write extends Message {
  public static expects = {
    expires: or(is(Date), isNil),
    key: is(String),
    path: or(is(String), isNil),
    value: or(is(Object), is(String))
  };
}

@moduleName('Cookies')
export class Delete extends Message {
  public static expects = { key: is(String) };
}
