import { is, either as or, keys } from 'ramda';
import { isEmittable } from '../util';
import Message from '../message';

export class Request extends Message {
  static defaults = { method: null, url: null, data: {}, params: {}, headers: {} };
  static expects = {
    method: is(String),
    url: is(String),
    data: or(is(String), is(Object)),
    params: is(Object),
    headers: is(Object),
    result: isEmittable,
    error: isEmittable,
  };
}

export class Post extends Request {
  static defaults = { method: 'POST', url: null, data: {}, params: {}, headers: {} };
}

export class Get extends Request {
  static defaults = { method: 'GET', url: null, data: {}, params: {}, headers: {} };
}

export class Put extends Request {
  static defaults = { method: 'PUT', url: null, data: {}, params: {}, headers: {} };
}

export class Head extends Request {
  static defaults = { method: 'HEAD', url: null, data: {}, params: {}, headers: {} };
}

export class Delete extends Request {
  static defaults = { method: 'DELETE', url: null, data: {}, params: {}, headers: {} };
}

export class Options extends Request {
  static defaults = { method: 'OPTIONS', url: null, data: {}, params: {}, headers: {} };
}

export class Patch extends Request {
  static defaults = { method: 'PATCH', url: null, data: {}, params: {}, headers: {} };
}

export const formData = data =>
  keys(data).map(key => [key, data[key]].map(encodeURIComponent).join('=')).join('&');
