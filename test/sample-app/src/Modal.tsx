import React from 'react';

import Message from 'casium/message'
import { container } from 'casium';

class Toggle extends Message {}

type LocalModel = {
  open: boolean
}

export default container<LocalModel>({
  init: (model) => {
    return {
      ...model,
      modal: {
        open: true
      }
    }
  },

  update: [
    [Toggle, (model) => ({
      ...model,
      modal: {
        open: !model.modal.open
      }
    })]
  ],

  view: (props, emit) => (
    <section className='modal'>
      <p>Modal is open? {(props as any).modal.open ? 'yes' : 'no'}</p>
      <button type='button' onClick={emit(Toggle)}>Toggle Modal</button>
    </section>
  ),
})