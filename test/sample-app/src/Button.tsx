import React from 'react';

import Message from 'casium/message'
import { scope, useApp } from 'casium';

class KeyDown extends Message {}

type LocalModel = {
    onClick: (msg: any) => void,
    numKeyPresses: number
}

export default scope<LocalModel>({
    name: 'button',

    init: (model) => {
        console.log('model from button init', model )
        return {
            numKeyPresses: 0
        }
    },

    update: [

        [KeyDown, useApp((app, model: LocalModel, msg) => {
            console.log('app from keypress', app)
            console.log('model from keypress', model )
            return {
                ...model,
                numKeyPresses: model.numKeyPresses + 1,
            }
        })],

    ],

    view: (props, emit) => (
        <button type='button' onClick={props.onClick} onKeyDown={emit(KeyDown)}>{props.children}</button>
    ),
})
