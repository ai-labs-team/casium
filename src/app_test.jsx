/* eslint-env node, mocha */
/* eslint-disable react/prop-types */
import React from 'react';
import { always, map, pick } from 'ramda';
import Message from './message';
import StateManager from './state_manager';
import { isolate, container, commands } from './app';

describe('app', () => {

  class Cmd extends Message {}
  class Msg extends Message {}
  class Msg2 extends Message {}

  describe('environment()', () => {

    it('sends state updates to listeners', () => {
      const stateMgr = new StateManager({ foo: true }), log = [];
      stateMgr.subscribe(log.push.bind(log));
      stateMgr.set({ bar: true });
      expect(log).to.deep.equal([{ foo: true }, { bar: true }]);
    });

  });

  describe('container()', () => {

    it('ignores non-object command values', () => {
      const ctr = isolate(container({
        update: [
          [Msg, always([{}, [true, new Cmd({ fooBar: true }), false, null, undefined]])],
        ],
      }));

      const commands = ctr.dispatch(new Msg());
      expect(commands).to.deep.equal([new Cmd({ fooBar: true })]);
      expect(commands[0]).to.be.an.instanceof(Cmd);
    });

    it('throws on constructor dispatch', () => {
      const ctr = isolate(container({ update: [] }));
      expect(() => ctr.dispatch(Msg)).to.throw(TypeError, /Attempted to dispatch message constructor/);
    });

    it('throws on invalid update return values', () => {
      const ctr = isolate(container({
        update: [
          [Msg, always([])],
          [Msg2, always(0)],
        ],
      }));

      expect(ctr.dispatch(new Msg())).to.be.an.instanceof(TypeError);
      expect(ctr.dispatch(new Msg2())).to.be.an.instanceof(TypeError);
    });

    it('accepts a flattened array with state and commands', () => {
      const ctr = isolate(container({
        update: [
          [Msg, always([{}, new Cmd({ foo: true }), new Cmd({ bar: false })])],
        ],
      }));

      expect(ctr.dispatch(new Msg())).to.deep.equal([
        new Cmd({ foo: true }),
        new Cmd({ bar: false }),
      ]);
    });
  });

  describe('emit()', () => {
    const update = [Msg, always({})];

    it('throws on unhandled messages', () => {
      const view = ({ emit }) => (<button onClick={emit(Msg2)}>Foo</button>);
      const ctr = isolate(container({ name: 'FooContainer', update, view }));

      expect(() => shallow(ctr()).html()).to.throw(
        "Messages of type 'Msg2' are not handled by container 'FooContainer' or any of its ancestors"
      );
    });

    it('does not throw on handled messages', () => {
      const view = ({ emit }) => (<button onClick={emit(Msg)}>Foo</button>);
      const ctr = isolate(container({ update, view }));
      expect(() => shallow(ctr()).html()).not.to.throw;
    });

    it('correctly maps DOM events from text inputs', () => {
      class InputEvent extends Message {}
      const log = [];

      const ctr = isolate(container({
        update: new Map([
          [InputEvent, (state, input) => {
            log.push(input);
            return state;
          }],
        ]),

        view: ({ emit }) => (
          <div><input type='text' onChange={emit(InputEvent)} /></div>
        ),
      }));

      const wrapper = mount(ctr()), input = wrapper.find('input');

      input.simulate('change', { target: { value: 'a' } });
      input.simulate('change', { target: { value: 'b' } });

      expect(map(pick(['type', 'value']), log)).to.deep.equal([
        { value: 'a', type: 'change' },
        { value: 'b', type: 'change' },
      ]);
    });

    it('correctly maps DOM events from checkboxes', () => {
      class CheckboxEvent extends Message {}
      const log = [];

      const ctr = isolate(container({
        init: always({ checked: false }),

        update: new Map([
          [CheckboxEvent, (state, input) => {
            log.push(input);
            return { checked: !state.checked };
          }],
        ]),

        view: ({ emit, checked }) => (
          <div><input type='checkbox' checked={checked} onClick={emit(CheckboxEvent)} /></div>
        ),
      }));

      const wrapper = mount(ctr()), input = wrapper.find('input');

      input.simulate('click');
      input.simulate('click');

      expect(map(pick(['type', 'value']), log)).to.deep.equal([
        { value: false, type: 'click' },
        { value: true, type: 'click' },
      ]);
    });
  });
});

describe('commands', () => {

  class Cmd extends Message {}
  class Cmd2 extends Message {}

  it('should return model', () => {
    expect(commands()({ foo: 'bar' })).to.deep.equal([{ foo: 'bar' }, []]);
  });

  it('should construct commands from parameters', () => {
    expect(commands(Cmd, { first: 1 }, Cmd2, { second: 2 })({ foo: 'bar' })).to.deep.equal([
      { foo: 'bar' },
      [new Cmd({ first: 1 }), new Cmd2({ second: 2 })],
    ]);
  });
});
