import React from 'react';

import Message from 'casium/message'
import { container, useApp } from 'casium';

class Toggle extends Message {}

type LocalModel = {
  open: boolean
}

export default container<LocalModel>({

  init: (model) => {
    return {
      ...model,
      open: true
    }
  },

  update: [
    [Toggle, (model) => ({
      ...model,
      open: !model.open
    })]

    // [Toggle, useApp((app, model: LocalModel, msg) => {
    //   console.log('app', app)
    //   return {
    //     open: !model.open
    //   }
    // })],

  ],

  view: (props, emit) => (
    <section className='modal'>
      <p>Modal is open? {(props as any).open ? 'yes' : 'no'}</p>
      <button type='button' onClick={emit(Toggle)}>Toggle Modal</button>
    </section>
  ),
})

