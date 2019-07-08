import React from 'react';

import Message from 'casium/message'
import { scope } from 'casium';

class Toggle extends Message {}

type LocalModel = {
  open: boolean
}

export default scope<LocalModel>({
  name: 'modal',

  init: (model) => {
    return {
      ...model,
      modal: {
        open: true
      }
    }
  },

  update: [
    // [Toggle, useApp((app, model: LocalModel, msg) => {
    //   console.log('app', app)
    //   return {
    //     open: !model.open
    //   }
    // })],

    [Toggle, (model: LocalModel, msg) => {
      return {
        open: !model.open
      }
    }],

  ],

  view: (props, emit) => (
    <section className='modal'>
      <p>Modal is open? {props.open ? 'yes' : 'no'}</p>
      <button type='button' onClick={emit(Toggle)}>Toggle Modal</button>
    </section>
  ),
})

// export brig<LocalModel>({
//   init: () => ({
//     open: false
//   }),
//
//   update: [
//       on(Toggle, (model, msg) => ({
//         open: !model.open
//       })),
//
//       on(Close, (model, msg) => ({
//         open: false
//       })),
//
//       on(Open, (model, msg) => ({
//         open: true
//       }),
//
//       on(LogAppCount, withApp<AppModel>((app, model, msg) => {
//         console.log('app count: ', app.count)
//         return model
//       }))),
//   ]
// })