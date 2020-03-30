import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import style from 'style/users/contacts';
import scrollLoader from '../../helpers/scrollspy';
import { fetchUsers } from '../../store/actions/user';
import NavBar from '../components/NavBar';
import SearchBar from '../components/SearchBar';
import Users from '../components/Users';

class Home extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      searchQuery: '',
      part: 0,
      users: [],
      endOfResults: false,
    };
    this.trackSearch = this.trackSearch.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
  }

  render() {

    const { auth, locale, darkMode, error } = this.props;
    const { users, endOfResults } = this.state;

    if (!auth.isAuthenticated) return <Redirect to="/login" />;

    return (
      <React.Fragment>
        <NavBar auth={auth} darkMode={darkMode} locale={locale} style={style} />
        <SearchBar
          darkMode={darkMode}
          locale={locale}
          style={style}
          trackSearch={this.trackSearch}
          onSearch={this.onSearch} />
        <Users
          auth={auth}
          darkMode={darkMode}
          locale={locale}
          style={style}
          users={users}
          endOfResults={endOfResults} />
      </React.Fragment>
    );
  }

  componentDidMount() {

    document.querySelector('html').classList.add(style.isClipped);
    document.body.className = `${style.body} ${style.fullScreenHeight} ${style.hasScrollbar}`;
    document.body.style.setProperty('padding-left', '4rem');
    if (this.props.darkMode) document.body.classList.add(style.dark);

    this.fetchUsers();

    scrollLoader({
      scroller: document.body,
      offset: .7,
      callback: this.fetchUsers,
    });
  }

  // componentDidUpdate(prevPros, prevState) {
  //   console.info(prevState, this.state);
  // }

  onSearch(e) {

    e.preventDefault();

    Promise.resolve(this.setState({
      endOfResults: false,
      users: [],
      part: 0
    }))
      .then(() => this.fetchUsers())
      .catch(console.error);
  }

  fetchUsers() {

    const { part, searchQuery, users, endOfResults } = this.state;

    if (endOfResults) return;

    this.props.fetchUsers(part, searchQuery)
      .then(({ users: _users, end }) => this.setState({
        users: [...users, ..._users],
        part: part + 1,
        endOfResults: end,
      }))
      .catch(console.error);
  }

  trackSearch(value) {

    this.setState({
      searchQuery: value,
      part: 0,
    });
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

export default connect(mapStateToProps, { fetchUsers })(Home);