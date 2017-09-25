import axios from 'axios';
import { pipe, identity } from 'ramda';
import { Request } from '../commands/http';
import { constructMessage } from '../util';

export default new Map([
  [Request, ({ method, url, data, params, headers, result, error, always }, dispatch) => {
    axios({ method, url, data, params, headers, withCredentials: true })
      .then(pipe(constructMessage(result), dispatch))
      .catch(pipe(constructMessage(error), dispatch))
      .then(always && pipe(constructMessage(always), dispatch) || identity);
  }],
]);
