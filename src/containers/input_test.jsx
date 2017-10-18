/* eslint-env node, mocha */
/* eslint-disable react/prop-types */
import React from 'react';
import { isolate, container } from '../app';
import InputContainer from './input';

describe('InputContainer', () => {

  const Container = isolate(container({
    init: () => ({ textField: 'foo' }),
    update: [],
    view: () => (<InputContainer><input name='textField' /></InputContainer>),
  }));

  const wrapper = mount(<Container />);

  describe('InputContainer', () => {

    it('initially renders inputs with state data', () => {
      expect(wrapper.find('input').prop('value')).to.equal('foo');
    });

    it('updates parent state with input changes', () => {
      wrapper.find('input').simulate('change', { target: { value: 'bar' } });
      expect(wrapper.find('input').prop('value')).to.equal('bar');
    });
  });

});
