import * as React from 'react';

const divStyle = {
  backgroundColor: 'red',
  color: 'white',
  padding: '3px',
};

export default ({ message }) => (<div style={divStyle}>{message}</div>);
