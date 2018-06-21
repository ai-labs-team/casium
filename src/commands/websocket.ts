import Message from '../message';
import { is } from 'ramda';

export class Listener extends Message {
  public static expects: any = { url: is(String) };
}

export class Send extends Message {

  public static expects: any = {
    url: is(String),
    message: is(String),
    result: Message.isEmittable,
    error: Message.isEmittable,
  };
}
