import { merge } from 'ramda';
import { createElement } from 'react';

import { Container, isolate as _isolate, IsolatedContainer, IsolateOptions } from '@casium/core';
import { RenderProps } from '@casium/core/environment';

import ViewWrapper from './components/view_wrapper';

export const renderer = <Model>(props: RenderProps<Model>) => createElement(ViewWrapper, props);

export const isolate = <Model>(ctr: Container<Model>, opts: IsolateOptions = {}): IsolatedContainer<Model> => (
  _isolate(ctr, merge(opts, { renderer }))
);
