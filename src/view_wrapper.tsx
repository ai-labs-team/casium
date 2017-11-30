import * as PropTypes from 'prop-types';
import { equals, keys, merge, mergeAll, omit, pick } from 'ramda';
import * as React from 'react';
import { Container, DelegateDef, Environment } from './app';
import ErrorComponent from './components/error';
import ExecContext from './exec_context';
import { Activate, Deactivate, Refresh } from './message';

export type ViewWrapperProps<M> = {
  childProps: M & { emit: (...args: any[]) => any },
  container: Container<M>,
  delegate: DelegateDef,
  env: Environment
};

/**
 * Component used to wrap container-defined view, for managing state and injecting
 * container-bound props.
 *
 * This component looks for `execContext` in its parent context, and propagates
 * itself with `execContext` in its children's contexts.
 */
export default class ViewWrapper<M> extends React.PureComponent<ViewWrapperProps<M>, any> {

  public static contextTypes = { execContext: PropTypes.object };

  public static childContextTypes = { execContext: PropTypes.object };

  public static propTypes = {
    childProps: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    delegate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.symbol,
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))]),
    env: PropTypes.object.isRequired
  };

  public static defaultProps = { delegate: null };

  public execContext?: ExecContext<M> = null;

  public unsubscribe: () => any;

  public getChildContext() {
    return { execContext: this.execContext };
  }

  public componentWillMount() {
    const parent = this.context.execContext;
    const { container, delegate, env, childProps } = this.props;

    if (delegate && !parent) {
      const msg = `Attempting to delegate state property '${delegate}' with no parent container`;
      throw new Error(msg);
    }
    this.execContext = new ExecContext({ env, parent, container, delegate });
    this.unsubscribe = this.execContext.subscribe(this.setState.bind(this));

    if (container.accepts(Activate)) {
      this.execContext.dispatch(new Activate(omit(['emit'], childProps), { shallow: true }));
      return;
    }
    const state = this.execContext.state();
    this.setState(this.execContext.push(merge(state, pick(keys(state), childProps))));
  }

  public componentWillReceiveProps(nextProps) {
    const nextChildProps = nextProps.childProps;
    const { container, childProps } = this.props;
    if (!equals(nextChildProps, childProps) && container.accepts(Refresh)) {
      this.execContext.dispatch(new Refresh(omit(['emit'], nextChildProps), { shallow: true }));
    }
  }

  public componentWillUnmount() {
    if (this.props.container.accepts(Deactivate)) {
      this.execContext.dispatch(new Deactivate({ shallow: true }));
    }
    this.unsubscribe();
  }

  public unstable_handleError(e) {
    // tslint:disable-next-line:no-console
    console.error('Failed to compile React component\n', e);
    this.setState({ componentError: e });
  }

  public render() {
    if (this.state.componentError) {
      return <ErrorComponent message={this.state.componentError.toString()} />;
    }
    // tslint:disable-next-line:variable-name
    const Child = (this.props.container as any).view, ctx = this.execContext;
    const props = mergeAll([this.props.childProps, ctx.state(), { emit: ctx.emit.bind(ctx) }]);
    return <Child {...props} />;
  }
}
