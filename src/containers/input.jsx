import { assoc, omit } from 'ramda';
import React from 'react';
import PropTypes from 'prop-types';

import { container, PARENT } from 'architecture';
import { cloneRecursive, withProps } from 'architecture/util';
import Message from 'architecture/message';

export class Change extends Message {}

const view = withProps({
  name: ({ children }) => children.props.name || 'unknownInput',
}, ({ emit, name, children, ...props }) => (
  <span>
    {cloneRecursive(children, {
      ...omit([name], props),
      value: props[name],
      onChange: emit([Change, { name }]),
    })}
  </span>
));

view.propTypes = {
  emit: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired,
};

export default container({
  name: 'InputContainer',

  delegate: PARENT,

  update: [
    [Change, (state, { name, value }) => assoc(name, value, state)],
  ],

  view,
});
