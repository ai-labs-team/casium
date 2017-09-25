import { is } from 'ramda';
import Message from 'architecture/message';

export class ReplaceHistory extends Message {
  static expects = { path: is(String) }
}

export class PushHistory extends Message {
  static expects = { path: is(String) }
}

export class Back extends Message {
}
