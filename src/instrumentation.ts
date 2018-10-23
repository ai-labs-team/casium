/**
 * Provides a mechanism for 'instrumentation' hooks to be applied to a Casium
 * application at runtime.
 *
 * Uses global state at `window[INSTRUMENTATION_KEY]` to allow
 * `withStateManager` and `onMessage` to by used both inside the main
 * application bundle (for example, to provide custom integration that is
 * internal to the application) or outside (for example, to implement external
 * tools such as the Casium Developer Tools).
 */
import { Container, GenericObject } from './core';
import ExecContext from './runtime/exec_context';
import StateManager from './runtime/state_manager';

import { applyTo } from 'ramda';

export type StateManagerCallback = (stateMgr: StateManager) => void;
export type OnMessageCallback = (msg: Message) => void;

export type Message = {
  context: ExecContext<any>;
  container: Container<any>;
  msg: GenericObject | null;
  prev: GenericObject | null;
  next: GenericObject;
  path: (string | symbol)[];
  cmds: any[];
  subs: any[];
};

export const INSTRUMENTATION_KEY = '__CASIUM_INSTRUMENTATION__';

declare global {
  interface Window {
    [INSTRUMENTATION_KEY]: {
      stateManager?: StateManager;
      withStateManager: StateManagerCallback[];
      onMessage: OnMessageCallback[];
    };
  }
}

/**
 * Executes `callback` with the root Execution Context's State Manager instance.
 * If the root Execution Context has not been initialized yet, execution of
 * `callback` is deferred until it is.
 */
/* istanbul ignore next */
export const withStateManager = (callback: StateManagerCallback) => {
  init();

  const { stateManager } = window[INSTRUMENTATION_KEY];

  stateManager ?
    callback(stateManager) :
    window[INSTRUMENTATION_KEY].withStateManager.push(callback);
};

/**
 * Executes `callback` whenever an Execution Context dispatches a Message.
 *
 * @note Any Messages that were dispatched *before* `callback` is registered
 * will *not* be applied. To ensure that all messages are captured, ensure that
 * `onMessage` is called *before* defining the root Container.
 */
/* istanbul ignore next */
export const onMessage = (callback: OnMessageCallback) => {
  init();
  window[INSTRUMENTATION_KEY].onMessage.push(callback);
};

/**
 * To be called by an Execution Context whenever it dispatches a Message.
 *
 * @note This function is *not* intended to be used by consumers; it should only
 * be called from within an Execution Context.
 */
export const notify = (msg: Message) =>
  hasWindow() &&
  hasInstrumentation() &&
  window[INSTRUMENTATION_KEY].onMessage.forEach(applyTo(msg));

/**
 * To be called by the root Execution Context when it is initialized. Processes
 * all pending `withStateManager` hooks.
 *
 * @note This function is *not* intended to be used by consumers; it should only
 * be called from within an Execution Context.
 */
export const intercept = (stateMgr: StateManager) => {
  if (hasWindow()) {
    init();

    window[INSTRUMENTATION_KEY].stateManager = stateMgr;

    /**
     * To avoid any potential pitfalls with multiple threads and contexts
     * operating at global state, process and clear each deferred
     * `withStateManager` hook sequentially
     */
    const { withStateManager } = window[INSTRUMENTATION_KEY];
    while (withStateManager.length > 0) {
      withStateManager.pop()(stateMgr);
    }
  }

  return stateMgr;
};

const hasWindow = () =>
  typeof window !== 'undefined';

const hasInstrumentation = () =>
  typeof window[INSTRUMENTATION_KEY] !== 'undefined';

const init = () =>
  hasWindow() &&
  !hasInstrumentation() &&
  (window[INSTRUMENTATION_KEY] = {
    stateManager: undefined,
    withStateManager: [],
    onMessage: []
  });
