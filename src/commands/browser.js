import { is } from 'ramda';
import Message from '../message';

/**
* PushHistory, ReplaceHistory, and Back classes manage the browser history. 
* Additionally, PushHistory and ReplaceHistory check if the path is a string
**/

export class ReplaceHistory extends Message {
	static expects = { path: is(String) };
}

export class PushHistory extends Message {
	static expects = { path: is(String) };
}

export class Back extends Message {}
