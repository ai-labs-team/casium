import * as React from 'react';

type LoadedProps = <T>(props: T) => React.ReactElement<T>;

export default class Loaded extends React.PureComponent<LoadedProps> {

  public render(): JSX.Element {
    const { children, ...props } = this.props;

    return (
      <React.Fragment>
        {React.Children.map(children, child => React.cloneElement(child as React.ReactElement<any>, {
          ...props,
        }))}
      </React.Fragment>
    );
  }
}
