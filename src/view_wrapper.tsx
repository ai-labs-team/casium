import * as PropTypes from 'prop-types';
import { equals, keys, merge, mergeAll, omit, pick } from 'ramda';
import * as React from 'react';
import { Container, DelegateDef, MessageConstructor } from './app';
import ErrorComponent from './components/error';
import { Environment } from './environment';
import ExecContext from './exec_context';
import { Activate, Deactivate, Refresh } from './message';

export type ViewWrapperProps<M> = {
  childProps: M & { emit: (...args: any[]) => any },
  container: Container<M>,
  delegate: DelegateDef,
  env?: Environment
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
    env: PropTypes.object.isRequired,
  };

  public static defaultProps = { delegate: null };

  public execContext?: ExecContext<M> = null;

  public unsubscribe: () => any;

  public getChildContext() {
    return { execContext: this.execContext };
  }

  public dispatchLifecycleMessage<M extends MessageConstructor>(message: M, props: any): boolean {
    const { container, childProps } = props;
    return container.accepts(message) &&
      this.execContext.dispatch(new message(omit(['emit', 'children'], childProps), { shallow: true })) &&
      true;
  }

  public componentWillMount() {
    const parent = this.context.execContext;
    const { container, delegate, env, childProps } = this.props;

    if (delegate && !parent) {
      const msg = `Attempting to delegate state property '${delegate.toString()}' with no parent container`;
      console.warn(msg); // tslint:disable-line:no-console
    }
    this.execContext = new ExecContext({ env, parent, container, delegate });
    this.unsubscribe = this.execContext.subscribe(this.setState.bind(this));

    if (this.dispatchLifecycleMessage(Activate, this.props)) {
      return;
    }

    const state = this.execContext.state();
    this.setState(this.execContext.push(merge(state, pick(keys(state), childProps))));
  }

  public componentDidUpdate(prevProps) {
    const prevChildProps = prevProps.childProps;
    const { childProps } = this.props;
    const omitChildren = omit(['children']);
    if (!equals(omitChildren(prevChildProps), omitChildren(childProps))) {
      this.dispatchLifecycleMessage(Refresh, this.props);
    }
  }

  public componentWillUnmount() {
    this.dispatchLifecycleMessage(Deactivate, this.props);
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
    const props = mergeAll([this.props.childProps, ctx.state(), { emit: ctx.emit.bind(ctx), relay: ctx.relay() }]);
    return <Child {...props} />;
  }
}
