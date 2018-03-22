import { complement as not, is, isNil } from 'ramda';
import Message from '../message';
import { moduleName } from '../util';

@moduleName('LocalStorage')
export class Read extends Message {
  public static expects = { key: is(String), result: Message.isEmittable };
}

@moduleName('LocalStorage')
export class Write extends Message {
  public static expects = { key: is(String), value: not(isNil) };
}

@moduleName('LocalStorage')
export class Delete extends Message {
  public static expects = { key: is(String) };
}

@moduleName('LocalStorage')
export class Clear extends Message {
  public static expects = {};
}
