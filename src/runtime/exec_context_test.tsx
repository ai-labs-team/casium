import { expect } from 'chai';
import 'mocha';
import { always } from 'ramda';
import * as React from 'react'
import ExecutionContext from './exec_context';
import { container } from '../core';
import { root } from '../environment';
import { mount } from 'enzyme';

import Message from '../message';

class Cmd extends Message {}

describe('ExecutionContext', () => {
  let Ctr;
  let exec_context;

  before(() => {
    Ctr =  container({
        init: always({ foo: true }),
        update: [],
        subscriptions: () => [
            new Cmd(),
            new Cmd({ foo: '1', bar: '2'}),
            {},
          ],
        view: () => (<div/>),
      });
    exec_context = new ExecutionContext({env: root, container: Ctr});
    mount(<Ctr />);
    exec_context.state();
  });

  it('should filter empty subscriptions', () => {
      console.log(exec_context.stateManager().listeners);
    expect(exec_context.stateManager().listeners).to.equal(2);
  });
});
