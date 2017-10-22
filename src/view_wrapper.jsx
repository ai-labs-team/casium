import { merge, mergeAll, pick, keys, omit } from 'ramda';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Activate } from './message';
import ExecContext from './exec_context';

/**
 * Component used to wrap container-defined view, for managing state and injecting
 * container-bound props.
 *
 * This component looks for `execContext` in its parent context, and propagates
 * itself with `execContext` in its childrens' contexts.
 */
export default class ViewWrapper extends Component {

  static contextTypes = { execContext: PropTypes.object };

  static childContextTypes = { execContext: PropTypes.object };

  static propTypes = {
    childProps: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    delegate: PropTypes.oneOfType([PropTypes.string, PropTypes.symbol]),
    env: PropTypes.object.isRequired
  };

  static defaultProps = { delegate: null };

  getChildContext() {
    return { execContext: this.execContext };
  }

  componentWillMount() {
    const parent = this.context.execContext;
    const { container, delegate, env, childProps } = this.props;

    if (delegate && !parent) {
      const msg = `Attempting to delegate state property '${delegate}' with no parent container`;
      throw new Error(msg);
    }
    this.execContext = new ExecContext({ env, parent, container, delegate });

    Object.assign(this, {
      subscriptions: [this.execContext.subscribe(this.setState.bind(this))],
    });

    if (container.accepts(Activate)) {
      this.execContext.dispatch(new Activate(omit(['emit'], childProps), { shallow: true }));
      return;
    }
    const state = this.execContext.state();
    this.setState(this.execContext.push(merge(state, pick(keys(state), childProps))));
  }

  componentWillUnmount() {
    this.subscriptions.forEach(unSub => unSub());
  }

  execContext = null;

  render() {
    const Child = this.props.container.view, ctx = this.execContext;
    const props = mergeAll([this.props.childProps, ctx.state(), { emit: ctx.emit.bind(ctx) }]);
    return <Child {...props} />;
  }
}
