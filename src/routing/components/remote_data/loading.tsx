import * as React from 'react';

export default class Loading extends React.PureComponent<void> {

  public render(): JSX.Element {
    return (
      <React.Fragment>
        {this.props.children}
      </React.Fragment>
    );
  }
}
