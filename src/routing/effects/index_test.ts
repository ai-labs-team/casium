import { expect } from 'chai';
import 'mocha';

import Message from '../../message';
import { ProcessState } from '../../subscription';
import { Navigation } from '../messages';
import Routing, { history, splitQuery } from './';

class StubMessage extends Message {}

describe('Routing Effects', () => {

  describe('Navigation', () => {
    let processState;
    let resultMsg;
    const dispatch = msg => resultMsg = msg;
    const navigationMsg = Routing.get(Navigation); // tslint:disable-line:mocha-no-side-effect-code

    const fooRemoteData = {
      bar: {
        path: ['baz'],
        cmd: () => {},
      },
    };

    const foo = {
      $: {
        url: '/foo',
        component: 'FooPage',
        data: { title: 'Foo' },
        redirect: null,
        remoteData: fooRemoteData,
      },
      child: {
        $: {
          url: '/:id',
          component: 'Child',
          data: {
            hideHeader: true,
            breadcrumb: {},
          },
        },
      },
    };

    const routes = {
      foo,
      bar: {
        $: {
          url: '/bar',
          redirect: foo,
        },
      },
      baz: {
        $: {
          url: '/baz',
          component: 'Baz',
        },
      },
    };

    const setProcessState = (state, current, url = null, newState = null) => () => {
      processState = new ProcessState({
        state,
        context: null,
        data: [{ data: { result: StubMessage, states: routes, load: StubMessage, current: { ...newState } } }],
        current,
        set: procState => processState.current = procState,
      });
      resultMsg = null;
      history.pushState({}, '', url);
      navigationMsg(processState, dispatch, null);
    };

    describe('when ProcessState is running', () => {
      before(setProcessState(ProcessState.RUNNING, null, '/foo'));

      describe('Route states', () => {

        describe('when the route is not loaded', () => {
          beforeEach(setProcessState(ProcessState.RUNNING, null, '/foo'));

          it('should dispatch the load message with params and requested data', () => {
            expect(resultMsg).to.deep.equal(new StubMessage({
              params: { },
              requestedData: [
                {
                  conditions: null,
                  remoteData: fooRemoteData,
                  redirect: null,
                  data: foo.$.data,
                },
              ],
            }));
          });
        });

        describe('when the route is not loaded and you redirect', () => {
          beforeEach(setProcessState(ProcessState.RUNNING, null, '/bar'));

          it('should dispatch the load message with params and requested data for the redirect', () => {
            expect(resultMsg).to.deep.equal(new StubMessage({
              params: { },
              requestedData: [
                {
                  conditions: null,
                  remoteData: fooRemoteData,
                  redirect: null,
                  data: foo.$.data,
                },
              ],
            }));
          });
        });

        describe('when the route is loaded and the route changes', () => {
          beforeEach(
            setProcessState(
              ProcessState.RUNNING,
              {
                remoteDataState: 'loaded',
                location: { state: routes.foo }
              },
              '/foo/child',
              {
                state: routes.foo.child, params: { id: 'child' }, data: {}, route: routes.foo.child
              }));

          it('should dispatch the load message with new params and requested data', () => {
            expect(resultMsg).to.deep.equal(new StubMessage({
              params: { id: 'child' },
              requestedData: [
                {
                  conditions: null,
                  remoteData: fooRemoteData,
                  redirect: null,
                  data: foo.$.data,
                },
                {
                  conditions: null,
                  remoteData: null,
                  redirect: null,
                  data: foo.child.$.data,
                },
              ],
            }));
          });
        });

        describe('when the route is loading and needs are met', () => {
          beforeEach(setProcessState(ProcessState.RUNNING,
                                     { remoteDataState: 'loading', location: { state: routes.baz } },
                                     '/baz', { state: routes.baz, params: { }, data: {}, route: routes.baz }));

          it('should dispatch the load message with new params and requested data', () => {
            expect(resultMsg).to.deep.equal(new StubMessage({
              data: {
                state: routes.baz,
                components: ['Baz'],
                data: { hideHeader: false, breadcrumb: {}, title: '' },
                requestData: [{
                  conditions: null,
                  remoteData: null,
                  data: {},
                  redirect: null,
                }],
                conditions: [null],
                remoteData: [[null]],
                componentsWithNeeds: [{
                  component: 'Baz',
                  needs: [],
                  policy: 'Loaded',
                }],
                redirect: undefined,
              },
              params: {},
            }));
          });

        });
      });
    });

    describe('when ProcessState is stopped', () => {
      let unsubscribe = false;
      before(setProcessState(ProcessState.STOPPED, { unsubscribe: () => unsubscribe = !unsubscribe }));

      it('unsubscribes', () => {
        expect(processState.current).to.deep.equal({});
        expect(unsubscribe).to.equal(true);
      });
    });
  });
});

describe('splitQuery', () => {

  it('given a query sting should generate an object of key value pairs', () => {
    expect(splitQuery('?foo=one&bar=two')).to.deep.equal({ foo: 'one', bar: 'two' });
  });
});
