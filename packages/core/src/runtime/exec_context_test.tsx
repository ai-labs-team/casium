import { expect } from 'chai';
import 'mocha';
import { always, nthArg } from 'ramda';
import * as React from 'react';
import { container, isolate } from '../core';
import { create } from '../environment';
import ExecutionContext from './exec_context';
import StateManager from './state_manager';

import Message from '../message';

class Cmd extends Message {}

describe('ExecutionContext', () => {
  let ctr: any;
  let execContext: any;

  before(() => {
    ctr =  isolate(container({
      init: always({ foo: true }),
      update: [[Cmd, model => model]],
      subscriptions: () => [
        {},
        null,
        false,
      ],
      view: () => (<div/>),
    }));
    execContext = new ExecutionContext({
      env: create({ dispatcher: nthArg(2), effects: new Map(), log: () => {}, stateManager: () => new StateManager() }),
      container: ctr
    });
    execContext.push({});
  });

  it('should filter empty subscriptions', () => {
    expect(() => execContext.state()).not.to.throw();
  });
});
