import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import style from 'style/users/chat.scss';
import NavBar from '../components/NavBar';

class Chat extends React.Component {

  constructor(props) {

    super(props);
  }

  render() {

    const { auth, locale, darkMode, error } = this.props;

    if (!auth.isAuthenticated) return <Redirect to="/login" />;

    return (
      <React.Fragment>
        <NavBar auth={auth} darkMode={darkMode} locale={locale} style={style} />
        <div className={`${style.columns} ${style.isVariable} ${style.is0}`}>
          <div className={`${style.column} ${style.is4Tablet} ${style.is3Desktop}`}>
            <nav className={`${style.panel} ${style.fullScreenHeight}`}></nav>
          </div>
        </div>
      </React.Fragment>
    );
  }

  componentDidMount() {

  }
}

function mapStateToProps(state) {

  return {
    auth: state.auth,
    locale: state.metaData.locale,
    darkMode: state.metaData.darkMode,
    error: state.error,
  };
}

export default connect(mapStateToProps, {})(Chat);