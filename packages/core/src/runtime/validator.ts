import Message, { Command, Constructor } from '../message';
import ExecContext from './exec_context';

type Check = 'emit' | 'cmd' | 'dispatch' | 'msg';

type Validator = (type: Check, data: {
  exec?: ExecContext<any>,
  updater?: (...args: any[]) => any,
  cmd?: Command<any>,
  msgCtor?: Constructor<any, Message<any>>,
  msg?: Message<any>
}) => void;

let check: Validator = () => {};

if (process.env.NODE_ENV !== 'production') {
  // tslint:disable-next-line:no-var-requires
  check = require('./validator_dev').default;
}

export { check };
