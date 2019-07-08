import React from 'react';

import Message from 'casium/message'
import { container, scope, useApp } from 'casium';
import Button from './Button'

class Close extends Message {}
class Toggle extends Message {}

type LocalModel = {
  open: boolean
}

export default scope<LocalModel>({
  name: 'modal',

  init: (model) => {
    return {
      ...model,
      open: true
    }
  },

  update: [

    [Close, (model: LocalModel, msg) => {
      return {
        open: false
      }
    }],

    [Toggle, useApp((app, model: LocalModel, msg) => {
      console.log('app', app)
      return {
        open: !model.open
      }
    })],

  ],

  view: (props, emit) => (
      <>
      <Button type='button' onClick={emit(Toggle)}>Toggle Modal</Button>
      {props.open &&
          <>
          <div className='modal-bg'></div>
          <section className='modal'>
            <p className='close' onClick={emit(Close)}>X</p>
            <p>{props.children}</p>
          </section>
          </>
      }
      </>
  ),
})
