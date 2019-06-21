import { Command, Emittable } from '../message';
import { moduleName } from '../util';

@moduleName('Browser')
export class ReplaceHistory extends Command<{ path: string }> {}

@moduleName('Browser')
export class PushHistory extends Command<{ path: string }> {}

@moduleName('Browser')
export class Back extends Command<{}> {}

@moduleName('Browser')
export class Forward extends Command<{}> {}

@moduleName('Browser')
export class Timeout extends Command<{ timeout: number, result: Emittable<{}> }> {}
