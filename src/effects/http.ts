import axios from 'axios';
import { identity, pipe } from 'ramda';
import { AbstractRequest } from '../commands/http';
import Message from '../message';

export default new Map([
  [AbstractRequest, (
    { method, url, data, params, headers, result, error, always, withCredentials = true },
    dispatch
  ) => {
    axios({ method, url, data, params, headers, withCredentials })
      .then(pipe(Message.construct(result), dispatch))
      .catch(pipe(Message.construct(error), dispatch))
      .then(always && pipe(Message.construct(always), dispatch) || identity);
  }],
]);
