import axios from 'axios';
import { pipe } from 'ramda';
import Message from '@casium/core/message';

import { GenericObject } from '../../core/src/core';
import { Command, Emittable } from '../../core/src/message';
import { moduleName, Omit } from '../../core/src/util';

type RequestParams = {
  method: string,
  url: string,
  data?: string | GenericObject,
  params?: GenericObject,
  headers?: GenericObject,
  result: Emittable<any>,
  error: Emittable<any>
};

type WithMethod = Omit<RequestParams, 'method'>;

@moduleName('HTTP')
export class Request<T = RequestParams> extends Command<T> {
  public static defaults: Partial<RequestParams> = { data: {}, params: {}, headers: {} };
}

@moduleName('HTTP')
export class Post extends Request<WithMethod> {
  public static defaults: Partial<RequestParams> = { method: 'POST', data: {} };
}

@moduleName('HTTP')
export class Get extends Request<WithMethod> {
  public static defaults: Partial<RequestParams> = { method: 'GET' };
}

@moduleName('HTTP')
export class Put extends Request<WithMethod> {
  public static defaults: Partial<RequestParams> = { method: 'PUT', data: {} };
}

@moduleName('HTTP')
export class Head extends Request<WithMethod> {
  public static defaults: Partial<RequestParams> = { method: 'HEAD' };
}

@moduleName('HTTP')
export class Delete extends Request<WithMethod> {
  public static defaults: Partial<RequestParams> = { method: 'DELETE' };
}

@moduleName('HTTP')
export class Options extends Request<WithMethod> {
  public static defaults: Partial<RequestParams> = { method: 'OPTIONS' };
}

@moduleName('HTTP')
export class Patch extends Request<WithMethod> {
  public static defaults: Partial<RequestParams> = { method: 'PATCH', data: {} };
}

export default new Map([
  [Request, ({ method, url, data, params, headers, result, error, always, withCredentials = true }, dispatch) => {
    axios({ method, url, data, params, headers, withCredentials })
      .then(pipe(Message.construct(result), dispatch))
      .catch(pipe(Message.construct(error), dispatch))
      .then(always && pipe(Message.construct(always), dispatch) || (v => v));
  }],
]);
