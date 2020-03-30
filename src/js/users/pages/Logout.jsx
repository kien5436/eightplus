import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { logout } from '../../store/actions/auth';

function Logout(props) {

  console.info('logout', props.logout());

  return <Redirect to="/login" />;
}

function mapStateToProps(state) {

  return {
    auth: state.auth,
    error: state.error,
  };
}

export default connect(null, { logout })(Logout);