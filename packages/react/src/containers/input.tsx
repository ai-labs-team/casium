import { assoc, defaultTo, omit, path, pipe } from 'ramda';
import * as React from 'react';

import { container, message, PARENT } from '@casium/core';
import Message from '@casium/core/message';
import { cloneRecursive, withProps } from '../util';

export class Change extends Message<{ name: string; value: string; }> {}

const name = pipe(path(['children', 'props', 'name']), defaultTo('unknownInput'));

/**
 * The `InputContainer` wraps an input to bind its updates to the model tree.
 * Updates to the wrapped input are assigned to the current model tree using the
 * `name` attribute of the input as the key to write to.
 *
 * @example
 * ```
 * import InputContainer from '@casium/react/containers/input';
 * 
 * const MyForm = (props) => (
 *   <InputContainer>
 *     <input type="text" name="firstName" value={props.firstName} />
 *   </InputContainer>
 *   <InputContainer>
 *     <input type="text" name="lastName" value={props.lastName} />
 *   </InputContainer>
 * );
 *
 * // This will result in a model like { firstName: "...", lastName: "..." }
 * ```
 */
export default container<any>({
  name: 'InputContainer',

  delegate: PARENT,

  update: [
    [Change, message(({ name, value }) => assoc(name, value))],
  ],

  view: withProps({ name }, ({ emit, name, children, ...props }: any) => (
    <span>
      {cloneRecursive(children, {
        ...omit([name], props),
        value: props[name],
        onChange: emit([Change, { name }]),
      })}
    </span>
  )),
});
