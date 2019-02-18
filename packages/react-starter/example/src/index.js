import React from 'react';
import { render } from 'react-dom';
// import { container, Message } from '@casium/react-starter';
// import { container, Message } from '../../src/index';

import View from './app-view';

const initialModel = {
  user: {
    id: 12345,
    name: 'Test User',
    email: 'test@user.com'
  },
  items: [
    {
      id: 1,
      title: 'Item 1',
      details: {
        body: 'This is the first item',
        lastUpdated: new Date(1547322948000)
      }
    },
    {
      id: 2,
      title: 'Item 2',
      details: {
        body: 'This is the middle item',
        lastUpdated: new Date(1547927795000)
      }
    },
    {
      id: 3,
      title: 'Item 3',
      details: {
        body: 'This is the last item',
        lastUpdated: new Date(1548532598000)
      }
    }
  ]
};

// const AppContainer = container({
//   init: () => initialModel,
//   view: View
// });

render(<View data={initialModel} />, document.getElementById('app'));
