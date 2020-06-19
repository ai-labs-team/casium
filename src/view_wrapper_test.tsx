/* tslint:disable:variable-name */
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import 'mocha';
import { always, merge, pipe } from 'ramda';
import * as React from 'react';
import { container, PARENT, withEnvironment } from './core';
import dispatcher from './dispatcher';
import { create as environment } from './environment';
import Message, { Activate, Deactivate, Refresh } from './message';

describe('ViewWrapper', () => {

  describe('componentWillMount', () => {

    describe('propagating prop values', () => {
      let Container: any;

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
        const updater: any = (state, { foo }) => merge(state, { foo, notFoo: foo === false });

        Container = container<{ foo: boolean, notFoo: boolean }>({
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
      let ContainerB: any, ContainerA: any;

      beforeEach(() => {
        class TestCommand extends Message {
          public static expects = { result: Message.isEmittable };
        }

        class TestCommandResult extends Message {}

        const testEffect = new Map<any, any>([
          [TestCommand, ({ result }, dispatch) => pipe<any, any, any>(Message.construct(result), dispatch)({})]
        ]);

        ContainerB = container<any>({
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

        ContainerA = withEnvironment(environment({ effects: testEffect, dispatcher }), {
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
