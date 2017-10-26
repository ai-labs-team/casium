/* tslint:disable:variable-name */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import 'mocha';
import { always, merge } from 'ramda';
import * as React from 'react';
import { container } from './app';
import { Activate } from './message';

describe('ViewWrapper', () => {

  describe('componentWillMount', () => {

    describe('propagating prop values', () => {
      let Container;

      beforeEach(() => {
        Container = container({
          init: always({ foo: true }),
          update: [],
          view: ({ foo }) => <span>foo: { foo ? 'true' : 'false' }</span>,
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
        Container = container({
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
});
