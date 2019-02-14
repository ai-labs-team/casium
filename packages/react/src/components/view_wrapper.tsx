import * as PropTypes from 'prop-types';
import { equals, keys, merge, mergeAll, omit, pick, pipe } from 'ramda';
import * as React from 'react';
import ErrorComponent from './components/error';
import { Container, DelegateDef } from '../../../core/src/core';
import { Environment } from '../../../core/src/environment';
import Message, { Activate, Constructor, Deactivate, Refresh } from '../../../core/src/message';
import ExecContext from '../../../core/src/runtime/exec_context';

export type ViewWrapperProps<Model> = {
  childProps: Model;
  container: Container<Model>;
  delegate: DelegateDef;
  env?: Environment;
};

/**
 * Component used to wrap container-defined view, for managing state and injecting
 * container-bound props.
 *
 * This component looks for `execContext` in its parent context, and propagates
 * itself with `execContext` in its children's contexts.
 */

export default class ViewWrapper<M, T> extends React.Component<ViewWrapperProps<M>, any> {

  public static contextTypes = { execContext: PropTypes.object };

  public static childContextTypes = { execContext: PropTypes.object };

  public static propTypes = {
    childProps: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    delegate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.symbol,
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))
    ]),
    env: PropTypes.object.isRequired,
  };

  public static defaultProps = { delegate: null };

  public execContext?: ExecContext<M> = null;

  public unsubscribe: () => void;

  public getChildContext() {
    return { execContext: this.execContext };
  }

  public dispatchLifecycleMessage<T extends Constructor<M, Message<M>>>(msg: T, props: ViewWrapperProps<M>): boolean {
    const { container, childProps } = props, propList = omit(['emit', 'children']);
    return container.accepts(msg) && !!this.execContext.dispatch(new msg(propList(childProps), { shallow: true }));
  }

  public mergeWithRelay(nextState: any) {
    return merge(nextState, { relay: this.execContext.relay() });
  }

  public componentWillMount() {
    const parent = this.context.execContext;
    const { container, delegate, env, childProps } = this.props;

    if (delegate && !parent) {
      const msg = `Attempting to delegate state property '${delegate.toString()}' with no parent container`;
      console.warn(msg); // tslint:disable-line:no-console
    }
    this.execContext = new ExecContext({ env, parent, container, delegate });
    this.unsubscribe = this.execContext.subscribe(pipe(this.mergeWithRelay.bind(this), this.setState.bind(this)));

    if (this.dispatchLifecycleMessage(Activate, this.props)) {
      return;
    }

    const state = this.execContext.state();
    this.setState(this.execContext.push(merge(state, pick(keys(state), childProps))));
  }

  public shouldComponentUpdate(nextProps, nextState) {
    return (
      !equals(nextProps.childProps, this.props.childProps) ||
      !equals(this.mergeWithRelay(nextState), this.state)
    );
  }

  public componentDidUpdate(prev) {
    const { childProps } = this.props;
    const omitChildren = omit(['children']);
    if (!equals(omitChildren(prev.childProps), omitChildren(childProps))) {
      this.dispatchLifecycleMessage(Refresh, this.props);
    }
  }

  public componentWillUnmount() {
    this.dispatchLifecycleMessage(Deactivate, this.props);
    this.unsubscribe();
    this.execContext.destroy();
  }

  public componentDidCatch(e) {
    this.handleError(e);
  }

  public unstable_handleError(e) {
    this.handleError(e);
  }

  public handleError(e) {
    const { container } = this.props;
    // tslint:disable-next-line:no-console
    console.error(`Error rendering view for container '${container.name}' -- `, e);
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
