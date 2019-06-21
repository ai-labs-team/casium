import { GenericObject } from '../core';
import { Command, Emittable } from '../message';
import { moduleName } from '../util';

export type HttpResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
};

type BaseRequest = {
  url: string;
  params?: GenericObject;
  headers?: GenericObject;
  result: Emittable<HttpResponse<any>>;
  error: Emittable<HttpResponse<any>>;
}

type WithBody = {
  data?: string | GenericObject;
};

export class AbstractRequest<T> extends Command<T & BaseRequest> {
  public static defaults = { method: null, url: null, data: {}, params: {}, headers: {} };
}

@moduleName('HTTP')
export class Request<T> extends AbstractRequest<T & { method: string; }> {
}

@moduleName('HTTP')
export class Post extends AbstractRequest<WithBody> {
  public static defaults = { method: 'POST', url: null, data: {}, params: {}, headers: {} };
}

new Post({ url: '/', result: null, error: null });

@moduleName('HTTP')
export class Get extends AbstractRequest<{}> {
  public static defaults = { method: 'GET', url: null, data: {}, params: {}, headers: {} };
}

@moduleName('HTTP')
export class Put extends AbstractRequest<WithBody> {
  public static defaults = { method: 'PUT', url: null, data: {}, params: {}, headers: {} };
}

@moduleName('HTTP')
export class Head extends AbstractRequest<{}> {
  public static defaults = { method: 'HEAD', url: null, data: {}, params: {}, headers: {} };
}

@moduleName('HTTP')
export class Delete extends AbstractRequest<{}> {
  public static defaults = { method: 'DELETE', url: null, data: {}, params: {}, headers: {} };
}

@moduleName('HTTP')
export class Options extends AbstractRequest<{}> {
  public static defaults = { method: 'OPTIONS', url: null, data: {}, params: {}, headers: {} };
}

@moduleName('HTTP')
export class Patch extends AbstractRequest<{}> {
  public static defaults = { method: 'PATCH', url: null, data: {}, params: {}, headers: {} };
}

export const formData = data =>
  Object.keys(data).map(key => [key, data[key]].map(encodeURIComponent).join('=')).join('&');
