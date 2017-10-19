import { pipe, defaultTo } from 'ramda';
import * as Cookies from 'js-cookie';
import { Read, Write, Delete } from '../commands/cookies';
import { constructMessage } from '../util';

/**
*
* This Map constructor handles reading, writing, and deleting of cookies using the
* javascript library js-cookie 
*
**/

export default new Map([
	[
		Read,
		({ key, result }, dispatch) =>
			Promise.resolve(Cookies.getJSON(key)).then(
				pipe(defaultTo({}), constructMessage(result), dispatch)
			)
	],
	[
		Write,
		({ key, value, path, expires }) =>
			Cookies.set(key, value, {
				path: path || '/',
				expires: expires || null
			})
	],
	[Delete, ({ key }) => Cookies.remove(key)]
]);
