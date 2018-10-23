import { complement, curry, either, isEmpty, isNil, path } from 'ramda';
import * as parse from 'url-parse';

export const exists = complement(either(isEmpty, isNil));

// tslint:disable-next-line:variable-name
const _href = keys => path(['_links', ...keys, 'href']);

export const href = curry((type, entity) => _href([type])(entity));
export const self = href('self');

// Each character can be neatly fitted into six bits. (<64 elements)
//
// We are going to place the digits and symbols haphazardly to make
// the final output seem like an ID.
const forward = '0123456789abcdefghijklmnopqrstuvwxyz-/_?&=';

// This is the Base-64 alphabet, which is also indexed by six bits.
// How convenient!
const bckward = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const forwardTable = new Map();

class BadCharError extends Error {}
class BadFurlError extends Error {}

const lookup = (source, table, char) => {
  if (table.size === 0) {
    source
      .split('')
      .forEach((char, i) => {
        table.set(char, i);
      });
  }
  if (!table.has(char)) {
    throw new BadCharError('bad char');
  }
  return table.get(char);
};

/** furl is the alternative to btoa that we use to encode the long HATEOAS URLs */
export const furl = (cleartext) => {
  if (!cleartext) {
    throw new BadFurlError(`unable to furl ${cleartext}`);
  }
  const parsed = parse(cleartext);
  const path = parsed.pathname + parsed.query;

  if (!path) {
    throw new BadFurlError(`unable to furl ${cleartext}`);
  }
  try {
    return path
      .toLowerCase()
      .split('')
      .map(char => bckward.charAt(lookup(forward, forwardTable, char)))
      .join('');
  } catch (e) {
    if (e instanceof Error) {
      throw new BadFurlError(`unable to furl ${cleartext}`);
    } else {
      throw e;
    }
  }
};
