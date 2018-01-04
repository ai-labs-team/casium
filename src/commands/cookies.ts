import { either as or, is, isNil } from 'ramda';
import Message from '../message';

export class Read extends Message {
  public static expects = { key: is(String), result: Message.isEmittable };
}

export class Write extends Message {
  public static expects = {
    expires: or(is(Date), isNil),
    key: is(String),
    path: or(is(String), isNil),
    value: or(is(Object), is(String))
  };
}

export class Delete extends Message {
  public static expects = { key: is(String) };
}
