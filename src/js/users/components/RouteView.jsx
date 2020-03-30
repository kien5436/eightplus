import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';

import Auth from '../pages/Auth';
import Home from '../pages/Home';
import Logout from '../pages/Logout';

function RouteView() {

  return (
    <Switch>
      <Route
        exact
        path='/'
        render={() => <Home />}
      />
      <Route
        exact
        path='/t'
        render={() => <p>chat</p>}
      />
      <Route
        exact
        strict
        path='/login'
        render={() => <Auth isRegister={false} />}
      />
      <Route
        exact
        path='/logout'
        render={() => <Logout />}
      />
      <Route
        exact
        strict
        path='/register'
        render={() => <Auth isRegister={true} />}
      />
      <Route
        exact
        path='/:user'
        render={() => <p>profile</p>}
      />
      <Route
        exact
        path='/:user/contacts'
        render={() => <p>contact</p>}
      />
      <Route
        render={() => <p>404</p>}
      />
    </Switch>
  );
}

export default withRouter(RouteView);