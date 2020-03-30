import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import './helpers/favicon';
import store from './store';
import RouteView from './users/components/RouteView';

store.subscribe(() => { console.info('store', store.getState()) })

function App() {

  return (
    <Provider store={store}>
      <Router>
        <RouteView/>
      </Router>
    </Provider>
  );
}

render(<App/>, document.getElementById('root'));