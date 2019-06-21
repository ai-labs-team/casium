import { GenericObject } from '../core';
import { Command, Emittable } from '../message';
import { moduleName } from '../util';

@moduleName('Cookies')
export class Read extends Command<{
  key: string,
  result: Emittable<{ key: string, value: string }>
}> {}

@moduleName('Cookies')
export class Write extends Command<{
  expires?: Date;
  path?: string;
  key: string;
  value: string | GenericObject;
}> {}

@moduleName('Cookies')
export class Delete extends Command<{ key: string }> {}
