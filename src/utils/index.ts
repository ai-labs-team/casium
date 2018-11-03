import { complement, curry, either, isEmpty, isNil, path } from 'ramda';

export const exists = complement(either(isEmpty, isNil));

// tslint:disable-next-line:variable-name
const _href = keys => path(['_links', ...keys, 'href']);

export const href = curry((type, entity) => _href([type])(entity));
export const self = href('self');
