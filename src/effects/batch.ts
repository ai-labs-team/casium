import { fromPairs, map, toPairs } from 'ramda';
import * as Batch from '../commands/batch';
import Message from '../message';

export default new Map([
  [Batch.All, (data, dispatch, execContext) => {
    Promise.all(map(
      ([key, { path, cmd, map, url }]) =>
        Batch.toPromise(execContext, cmd, false, null, null).then(data => [key, { path, data, map, url }]),
      toPairs(data.commands))).then(all =>
        dispatch(Message.construct(data.result || Batch.Result, { data: fromPairs(all), ...data.passThrough })))
      .catch(err => dispatch(Message.construct(data.error || Batch.Result, err)));
  }],
]);
