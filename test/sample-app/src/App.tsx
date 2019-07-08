import React from 'react';
import logo from './logo.svg';
import './App.css';
import Message from 'casium/message'
import { container } from 'casium';
import Modal from './Modal'

class ChangeStep extends Message {}
class Decrement extends Message {}
class Increment extends Message {}

export type Model = {
  counter: number,
  step: number,
}

export default container<Model>({
  name: 'TopLevelApp',

  init: model => ({
    counter: 0,
    step: 1,
  }),

  update: [
    [ChangeStep, (model, msg) => ({
      ...model,
      step: parseInt(msg.value, 10)
    })],

    [Decrement, (model) => ({
      ...model,
      counter: model.counter - model.step,
    })],

    [Increment, (model) => ({
      ...model,
      counter: model.counter + model.step,
    })],
  ],

  view: (model, emit) => (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Counter: {model.counter}
        </p>
        <button type='button' onClick={emit(Increment)}> + {model.step} </button>
        <button type='button' onClick={emit(Decrement)}> - {model.step} </button>
        <label>
          Step:
          <input type='number' onChange={emit(ChangeStep)} value={model.step}></input>
        </label>
        <Modal open={false}/>
      </header>
    </div>
  ),
})
