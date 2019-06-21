import { GenericObject } from '../core';
import { Command, Emittable } from '../message';
import { moduleName } from '../util';

@moduleName('LocalStorage')
export class Read extends Command<{
  key: string;
  result: Emittable<{ key: string, value: GenericObject | null }>;
}> {}

@moduleName('LocalStorage')
export class Write extends Command<{ key: string, value: any }> {}

@moduleName('LocalStorage')
export class Delete extends Command<{ key: string }> {}

@moduleName('LocalStorage')
export class Clear extends Command<{}> {}
