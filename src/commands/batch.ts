import { curry, is, merge } from 'ramda';
import Message, { MessageConstructor } from '../message';

type AllType = {
  commands: any[];
  result: MessageConstructor;
  error: MessageConstructor;
  passThrough: any;
};
export class All extends Message {

  constructor({ commands, result, error, passThrough }: AllType) {
    super({ commands, result, error, passThrough });
  }
}

export class Error extends Message {}
export class Result extends Message {}

export type MsgPromise = Promise<{ [key: string]: any }>;
export const toPromise = curry((exec, msg: Message, normalDispatch, result, error): MsgPromise =>
  new Promise((resolve, reject) => {
    const dispatch = normalDispatch ? exec.dispatch
    : (out: Message) => is(Result, out) ? resolve(out.data) : reject(out.data);

    exec.env.dispatcher(merge(exec, { dispatch }), msg.map({ result: result || Result, error: error || Error }));
  }));
