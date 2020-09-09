import { either as or, is, keys } from 'ramda';
import Message from '../message';
import { moduleName } from '../util';

type Defaults = {
  method: string | null,
  url: null,
  data: {},
  params: {},
  headers: {},
  responseType: string | null | undefined,
};

@moduleName('HTTP')
export class Request extends Message {
  public static defaults: Defaults =
    { method: null, url: null, data: {}, params: {}, headers: {}, responseType: 'json' };

  public static expects = {
    method: is(String),
    url: is(String),
    data: or(is(String), is(Object)),
    params: is(Object),
    headers: is(Object),
    result: Message.isEmittable,
    error: Message.isEmittable,
    responseType: is(String),
  };
}

@moduleName('HTTP')
export class Post extends Request {
  public static defaults: Defaults =
    { method: 'POST', url: null, data: {}, params: {}, headers: {}, responseType: 'json' };
}

@moduleName('HTTP')
export class Get extends Request {
  public static defaults: Defaults =
    { method: 'GET', url: null, data: {}, params: {}, headers: {}, responseType: 'json' };
}

@moduleName('HTTP')
export class Put extends Request {
  public static defaults: Defaults =
    { method: 'PUT', url: null, data: {}, params: {}, headers: {}, responseType: 'json' };
}

@moduleName('HTTP')
export class Head extends Request {
  public static defaults: Defaults =
    { method: 'HEAD', url: null, data: {}, params: {}, headers: {}, responseType: 'json' };
}

@moduleName('HTTP')
export class Delete extends Request {
  public static defaults: Defaults =
    { method: 'DELETE', url: null, data: {}, params: {}, headers: {}, responseType: 'json' };
}

@moduleName('HTTP')
export class Options extends Request {
  public static defaults: Defaults =
    { method: 'OPTIONS', url: null, data: {}, params: {}, headers: {}, responseType: 'json' };
}

@moduleName('HTTP')
export class Patch extends Request {
  public static defaults: Defaults =
    { method: 'PATCH', url: null, data: {}, params: {}, headers: {}, responseType: 'json' };
}

export const formData = data =>
  keys(data).map(key => [key, data[key]].map(encodeURIComponent).join('=')).join('&');
