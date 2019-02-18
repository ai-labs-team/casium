/* tslint:disable:variable-name */
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import 'mocha';
import { always, merge, pipe } from 'ramda';

import * as React from 'react';

import { environment, PARENT, withEnvironment } from '@casium/core';
import dispatcher from '@casium/core/dispatcher';
import Message, { Activate, Command, Deactivate, Emittable, Refresh } from '@casium/core/message';
import { renderer } from '../index';
import ViewWrapper from './view_wrapper';

describe('ViewWrapper', () => {

  let container;

  before(() => {
    container = withEnvironment({ renderer, effects: new Map() });
  });

  describe('componentWillMount', () => {

    describe('propagating prop values', () => {
      let Container;

      beforeEach(() => {
        Container = container({
          init: always({ foo: true }),
          update: [],
          view: ({ foo }: any) => <span>foo: { foo ? 'true' : 'false' }</span>,
        });
      });

      it('renders initial state by default', () => {
        const wrapper = shallow(<Container />);
        expect(wrapper.html().includes('foo: true')).to.be.true;
      });

      it('auto-copies props to state when Activate is not implemented', () => {
        const wrapper = shallow(<Container foo={false} />);
        expect(wrapper.html().includes('foo: false')).to.be.true;
      });

    });

    describe('propagating prop values, the legend continues', () => {
      let Container;

      beforeEach(() => {
        Container = container<any>({
          init: always({ foo: true, notFoo: false }),
          update: [
            [Activate, (state, { foo }) => merge(state, { notFoo: foo === false })],
          ],
          view: ({ foo, notFoo }) => (
            <span>
              foo: { foo ? 'true' : 'false' }, notFoo: { notFoo ? 'true' : 'false' }
            </span>
          ),
        });
      });

      it('renders initial state by default', () => {
        const wrapper = shallow(<Container />);
        expect(wrapper.html().includes('foo: true, notFoo: false')).to.be.true;
      });

      it('maps props through Activate handler instead of copying', () => {
        const wrapper = shallow(<Container foo={false} />);
        expect(wrapper.html().includes('foo: true, notFoo: true')).to.be.true;
      });
    });
  });

  describe('componentDidUpdate', () => {

    describe('updating prop values with refresh', () => {
      let Container;

      beforeEach(() => {
        const updater = (state, { foo }) => merge(state, { foo, notFoo: foo === false });

        Container = container({
          init: always({ foo: true, notFoo: false }),
          update: [
            [Activate, updater],
            [Refresh, updater],
          ],
          view: ({ foo, notFoo }) => (
            <span>
              {`foo: ${foo ? 'true' : 'false'}, notFoo: ${notFoo ? 'true' : 'false'}`}
            </span>
          ),
        });
      });

      it('updates foo from true to false', () => {
        const wrapper = mount(<Container />);
        wrapper.setProps({ foo: false });
        expect(wrapper.html().includes('foo: false, notFoo: true')).to.be.true;
      });

    });
  });

  describe('componentWillUnmount', () => {

    describe('unmounting child component causes a state change', () => {
      let ContainerB, ContainerA;

      beforeEach(() => {
        ContainerB = container<any>({
          init: state => merge(state, { bar: true }),
          delegate: PARENT,
          update: [
            [Deactivate, state => merge(state, { bar : false })],
          ],
          view: ({ bar }) => (
            <span></span>
          ),
        });

        ContainerA = container<any>({
          init: always({ foo: true }),
          update: [
            [Refresh, (state, { foo }) => merge(state, { foo })],
          ],
          view: state => (
            <span>
              <div>{JSON.stringify(state)}</div>
              {state.foo && <ContainerB />}
            </span>
          ),
        });
      });

      it('updates bar from true to false', () => {
        const wrapper = mount(<ContainerA />);
        expect(wrapper.html().includes('"bar":true')).to.be.true;
        wrapper.setProps({ foo: false });
        expect(wrapper.html().includes('"bar":false')).to.be.true;
      });

    });
  });

  describe('Commands', () => {

    describe('ContainerA environment should cascade to ContainerB', () => {
      let ContainerB, ContainerA;

      beforeEach(() => {
        class TestCommand extends Command<{ result: Emittable<any> }> {}
        class TestCommandResult extends Message<any> {}

        const testEffect = new Map([
          [TestCommand, ({ result }, dispatch) => pipe(Message.construct(result), dispatch)({})]
        ]);

        ContainerB = container({
          init: state => merge(state, { bar: true }),
          delegate: PARENT,
          update: [
            [Activate, state => [
              merge(state, { bar: false }),
              new TestCommand({ result: TestCommandResult }),
            ]],
            [TestCommandResult, state => merge(state, { bar: true })]
          ],
          view: () => (
            <span></span>
          ),
        });

        ContainerA = withEnvironment(environment({
          effects: testEffect,
          dispatcher,
          renderer: props => React.createElement(ViewWrapper, props),
        }), {
          init: always({ foo: true }),
          view: state => (
            <span>
              <div>{JSON.stringify(state)}</div>
              <ContainerB />
            </span>
          ),
        });
      });

      it('updates bar from true to false, and then back to true', () => {
        const wrapper = mount(<ContainerA />);
        expect(wrapper.html().includes('"bar":true')).to.be.true;
      });

    });
  });
});
