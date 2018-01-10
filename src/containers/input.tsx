import { assoc, defaultTo, omit, path, pipe } from 'ramda';
import * as React from 'react';

import { container, Container, PARENT } from '../core';
import Message from '../message';
import { cloneRecursive, withProps } from '../util';

export class Change extends Message {}

const name = pipe(path(['children', 'props', 'name']), defaultTo('unknownInput'));

export default container({
  name: 'InputContainer',

  delegate: PARENT,

  update: [
    [Change, (state, { name, value }) => assoc(name, value, state)],
  ],

  view: withProps({ name }, ({ emit, name, children, ...props }) => (
    <span>
      {cloneRecursive(children, {
        ...omit([name], props),
        value: props[name],
        onChange: emit([Change, { name }]),
      })}
    </span>
  )),
}) as Container<any>;
