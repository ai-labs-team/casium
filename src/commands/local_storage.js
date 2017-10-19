import { is, complement as not, isNil } from 'ramda';
import Message from '../message';
import { isEmittable } from '../util';

/**
*
* These classes are used to handle interactions with local storage. 
*
**/

export class Read extends Message {
	static expects = { key: is(String), result: isEmittable };
}

export class Write extends Message {
	static expects = { key: is(String), value: not(isNil) };
}

export class Delete extends Message {
	static expects = { key: is(String) };
}

export class Clear extends Message {
	static expects = {};
}
