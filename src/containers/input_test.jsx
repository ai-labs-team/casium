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

  describe('InputContainer', () => {

    it('initially renders inputs with state data', () => {
      const wrapper = mount(<Container />);
      expect(wrapper.find('input').prop('value')).to.equal('foo');
    });

    it('updates parent state with input changes', () => {
      const wrapper = mount(<Container />);
      wrapper.find('input').simulate('change', { target: { value: 'bar' } });
      expect(wrapper.find('input').prop('value')).to.equal('bar');
    });
  });

});
