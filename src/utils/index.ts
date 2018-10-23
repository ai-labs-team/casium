import { complement, either, isEmpty, isNil } from 'ramda';

export const exists = complement(either(isEmpty, isNil));
