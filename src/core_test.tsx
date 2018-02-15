import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import 'mocha';
import { always, evolve, identity, inc, map, mergeAll, not, pick, pipe, prop, unapply } from 'ramda';
import * as React from 'react';
import { commands, container, isolate, mapModel, message, seq } from './core';
import Message from './message';
import StateManager from './runtime/state_manager';

describe('app', () => {

  class Cmd extends Message {}
  class Cmd2 extends Message {}

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

    describe('subscriptions', () => {
      it('is called with the new model value after every Updater', () => {
        const log = [];

        const ctr = isolate(container({
          subscriptions: model => log.push(model),

          update: [
            [Msg, (model, { count }) => ({ test: count })],
          ],
        }));

        ctr.dispatch(new Msg({ count: 'one' }));
        ctr.dispatch(new Msg({ count: 'two' }));

        expect(log).to.deep.equal([
          { test: 'one' },
          { test: 'two' }
        ]);
      });
    });
  });

  describe('emit()', () => {
    const update = [Msg, always({})];

    it('throws on unhandled messages', () => {
      const view = ({ emit }) => (<button onClick={emit(Msg2)}>Foo</button>);
      const ctr = container({ name: 'FooContainer', update, view });

      expect(() => shallow(ctr()).html()).to.throw(
        "Messages of type 'Msg2' are not handled by container " +
        "'FooContainer' or any of its ancestors"
      );
    });

    it('does not throw on handled messages', () => {
      const view = ({ emit }) => (<button onClick={emit(Msg)}>Foo</button>);
      const ctr = container({ update, view });
      expect(() => shallow(ctr()).html()).not.to.throw;
    });

    it('correctly maps DOM events from text inputs', () => {
      class InputEvent extends Message {}
      const log = [];

      const ctr = isolate(container({
        update: [
          [InputEvent, (state, input) => {
            log.push(input);
            return state;
          }],
        ],

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

      const ctr = isolate(container<any>({
        init: always({ checked: false }),

        update: [
          [CheckboxEvent, (state, input) => {
            log.push(input);
            return { checked: !state.checked };
          }],
        ],

        view: ({ emit, checked }) => (
          <div><input type='checkbox' checked={checked} onClick={emit(CheckboxEvent)} /></div>
        ),
      }));

      const wrapper = mount(ctr()), input = wrapper.find('input');

      input.simulate('click');
      input.simulate('click');

      expect(map(pick(['type', 'value']), log)).to.deep.equal([
        { value: false, type: 'click' },
        { value: true, type: 'click' }
      ]);
    });
  });

  describe('commands', () => {
    it('should return the model', () => {
      expect(commands()({ foo: 'bar' })).to.deep.equal([{ foo: 'bar' }, []]);
    });

    it('should construct commands from parameters', () => {
      expect(commands(Cmd, { first: 1 }, Cmd2, { second: 2 })({ foo: 'bar' })).to.deep.equal([
        { foo: 'bar' },
        [new Cmd({ first: 1 }), new Cmd2({ second: 2 })]
      ]);
    });

    it('should map command data from parameters', () => {
      expect(commands(Cmd, identity)({ foo: 'bar' })).to.deep.equal([
        { foo: 'bar' },
        [new Cmd({ foo: 'bar' })]
      ]);
    });

    it('allows empty command values', () => {
      expect(commands(Cmd, { here: true }, false && Cmd, { gone: true })({})).to.deep.equal([
        {},
        [new Cmd({ here: true }), null]
      ]);
    });
  });

  describe('seq', () => {
    it('maps model changes across multiple updaters', () => {
      const updater = seq(evolve({ foo: not }), evolve({ bar: inc }));
      expect(updater({ foo: false, bar: 41 })).to.deep.equal([{ foo: true, bar: 42 }, []]);
    });

    it('aggregates commands across multiple updaters', () => {
      const updater = seq(commands(Cmd, { first: 1 }), commands(Cmd2, { second: 2 }));
      expect(updater({ foo: true, bar: 42 })).to.deep.equal([
        { foo: true, bar: 42 },
        [new Cmd({ first: 1 }), new Cmd2({ second: 2 })]
      ]);
    });

    it('passes through all updater params', () => {
      const updater = seq((state, message, relay) => mergeAll([state, message, relay]));
      expect(updater({ foo: true }, { bar: false }, { baz: true })).to.deep.equal([{
        foo: true, bar: false, baz: true
      }, []]);
    });

    it('keeps calling if a function is returned', () => {
      const list = unapply(identity);
      const updater = seq(pipe(list, mergeAll, always));

      expect(updater({ foo: true }, { bar: false }, { baz: true })).to.deep.equal([{
        foo: true, bar: false, baz: true
      }, []]);
    });
  });

  describe('mapModel', () => {
    it('maps new model values by pairing keys to updaters', () => {
      const updater = mapModel({ foo: pipe(prop('bar'), not) });
      expect(updater({ foo: false, bar: false })).to.deep.equal({ foo: true, bar: false });
    });

    it('works with parameter helpers', () => {
      const updater = mapModel({ form: message(pick(['email', 'password'])) });
      const result = updater(
        { form: {}, misc: 'things' },
        { email: 'foo@bar.com', password: 'passw0rd', other: 'values' }
      );
      expect(result).to.deep.equal({ form: { email: 'foo@bar.com', password: 'passw0rd' }, misc: 'things' });
    });

    it('works with parameter helpers, v2', () => {
      const updater = mapModel(message(
        ({ value }) => value ? { rememberMe: true, form: { email: value } } : { rememberMe: false }
      ));
      expect(updater({ rememberMe: null, form: {} }, { value: 'foo@bar.com' })).to.deep.equal({
        rememberMe: true, form: { email: 'foo@bar.com' }
      });
      expect(updater({ rememberMe: null, form: {} }, { value: '' })).to.deep.equal({
        rememberMe: false, form: {}
      });
    });
  });
});
