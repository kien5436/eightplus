import React from 'react';
import { connect } from 'react-redux';

import i18n from 'i18n';
import { SCONTENT_PATH } from '../../constants';

function User({ darkMode, style, user, dict }) {

  return (
    <div className={`${style.column} ${style.is3Desktop} ${style.isHalfTablet}`}>
      <div className={`${style.user} ${style.columns} ${style.isVcentered} ${style.isVariable} ${style.is1} ${style.box}`}>
        <div className={`${style.column} ${style.is4}`}>
          <figure className={`${style.image} ${style.is64x64}`} data-modal='modal-user-info'>
            <img src={SCONTENT_PATH + user.avatar.x64} className={style.isRounded} />
          </figure>
        </div>
        <div className={style.column}>
          <p className={`${style.title} ${style.is6} ${style.is2Line}${darkMode ? style.hasTextGreyLighter : ''}`} data-modal='modal-user-info' title={user.name}>{user.name}</p>
          <a href="#" className={`${style.button} ${style.isSmall}${darkMode ? `${style.hasBackgroundDark} ${style.hasTextGreyLighter}` : ''}`} role="button">
            <span className={style.icon}>
              <i className={`${style._icon} ${style.iconMail}`}></i>
            </span>
            <span>{dict.btnSend}</span>
          </a>
          <div className={style.dropdown}>
            <div className={style.dropdownTrigger}>
              <button type="button" aria-haspopup="true" aria-controls="dropdown-menu" className={`${style.button} ${style.isSize7}${darkMode ? `${style.hasBackgroundDark} ${style.hasTextGreyLighter}` : ''}`}>
                <span className={`${style.icon} ${style.isSmall}`}>
                  <i className={`${style._icon} ${style.iconCog}`}></i>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

class Users extends React.Component {

  constructor(props) {

    super(props);
  }

  render() {

    const { darkMode, style, locale, users, endOfResults } = this.props;
    const userList = [];
    const dict = i18n(locale, 'contacts');

    if (users.length > 0) {
      for (const user of users) {
        userList.push(<User key={user._id} darkMode={darkMode} locale={locale} style={style} user={user} dict={dict} />);
      }
    }

    return (
      <section className={style.section}>
        <div className={`${style.columns} ${style.isMultiline}`}>
          {userList.length > 0 && userList}
        </div>
        {endOfResults && <p className={`${style.isSize6} ${style.hasTextCentered}`}>{dict.endOfResults}</p>}
      </section>
    );
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

    // if (prevProps.users.length === this.props.users.length)
  }
}

function mapStateToProps(state) {

  return {
    auth: state.auth,
  };
}

export default Users;