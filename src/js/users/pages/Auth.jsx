import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import 'particles.js';
import 'datepickerx/dist/js/DatePickerX.min';

import style from 'style/users/login-register.scss';
import i18n from 'i18n';
import { authUser } from '../../store/actions/auth';
import { setError, removeError } from '../../store/actions/error';

class Auth extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      email: '',
      name: '',
      password: '',
      dob: '',
      sex: 'male',
    };
    this.datePicker = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.removeError = this.removeError.bind(this);
    this.setSex = this.setSex.bind(this);
  }

  render() {

    const { auth, locale, error, isRegister } = this.props;

    if (auth.isAuthenticated) return <Redirect to="/" />;

    const dict = {
      login: i18n(locale, 'login'),
      register: i18n(locale, 'register'),
      error: i18n(locale, 'error'),
    };
    const lang = dict.login.locale;
    const listLang = [];
    const sexes = ['other', 'female', 'male'];
    const sexComponents = [];

    for (const locale in lang)
      if (lang.hasOwnProperty(locale))
        listLang.push(<li key={locale} className={style.hasTextGreyLighter}>{lang[locale]}</li>);

    for (let i = sexes.length; --i >= 0;) {

      sexComponents.push(
        <label key={i} className={`${style.radio} ${style.hasTextGreyLighter}`}>
          <input type="radio" name="sex" value={sexes[i]} defaultChecked={'male' === sexes[i]} onClick={this.setSex} />
          {dict.register.sex[sexes[i]]}
        </label>
      );
    }

    return (
      <section className={`${style.hero} ${style.isFullheight}`} id="particles">
        <div className={style.heroBody}>
          <form className={style.box} method="post" onSubmit={this.onSubmit}>
            <div className={style.logo}></div>
            <h1 className={`${style.title} ${style.hasTextGreyLighter} ${style.hasTextCentered}`}>Messpresso</h1>
            {isRegister && <Field
              name='name'
              value={this.state.name}
              placeholder={dict.register.phName}
              attrs={{ autoFocus: true }}
              onChange={this.onChange}
              onInput={this.removeError}
              error={error && this.props.error.name}
              errDict={dict.error} />}
            <Field
              name='email'
              value={this.state.email}
              placeholder={dict.login.phEmail}
              attrs={{ autoFocus: true }}
              onChange={this.onChange}
              onInput={this.removeError}
              error={this.props.error && this.props.error.email}
              errDict={dict.error} />
            <Field
              type='password'
              name='password'
              value={this.state.password}
              placeholder={dict.login.phPassword}
              onChange={this.onChange}
              onInput={this.removeError}
              error={this.props.error && this.props.error.password}
              errDict={dict.error} />
            {this.props.isRegister && <Field
              name='dob'
              value={this.state.dob}
              placeholder={dict.register.phDob}
              attrs={{ id: 'datePicker', ref: this.datePicker }}
              onChange={this.onChange}
              error={this.props.error && this.props.error.dob}
              errDict={dict.error} />}
            {this.props.isRegister && <React.Fragment>
              <div className={style.field}>
                <div className={style.control}>
                  {sexComponents}
                </div>
                {this.props.error && this.props.error.sex && <p className={`${style.help} ${style.isDanger}`}>{dict.error[this.props.error.sex.message]}</p>}
              </div>
              <div className={style.field}>
                <p className={`${style.help} ${style.hasTextGreyLighter}`}>
                  {dict.register.term['1']}
                  <a href="#" className={style.hasTextLink} target="blank">{dict.register.term['2']}</a>
                </p>
              </div>
            </React.Fragment>}
            {!this.props.isRegister && <div className={style.field}>
              <Link to="#" className={`${style.hasTextLink} ${style.isSize7}"`}>{dict.login.forgotText}</Link>
            </div>}
            <button className={`${style.button} ${style.isFullwidth} ${style.hasBackgroundBlack} ${style.hasTextGreyLighter}`} type="submit">
              {this.props.isRegister ? dict.register.submitText : dict.login.submitText}
            </button>
            <hr />
            <p className={`${style.help} ${style.hasTextGreyLighter}`}>
              {this.props.isRegister ? dict.register.askAccount : dict.login.askAccount}
              <Link to={this.props.isRegister ? '/login' : '/register'} className={style.hasTextLink} id="redirect" onClick={this.removeError}>
                {this.props.isRegister ? dict.register.referText : dict.login.referText}
              </Link>
            </p>
          </form>
          <div className={style.menu}>
            <ul className={style.menuList}>{listLang}</ul>
          </div>
        </div>
      </section>
    );
  }

  componentDidMount() {

    document.querySelector('html').classList.remove(style.isClipped);
    document.body.style.setProperty('padding-left', 'unset');

    particlesJS('particles', {
      'particles': {
        'number': {
          'value': 40,
          'density': {
            'enable': true,
            'value_area': 800
          }
        },
        'color': {
          'value': '#fff'
        },
        'shape': {
          'type': 'circle',
          'stroke': {
            'width': 0,
            'color': '#000'
          },
          'polygon': {
            'nb_sides': 5
          }
        },
        'size': {
          'value': 5,
          'random': true,
          'anim': {
            'enable': false,
            'speed': 1000,
            'size_min': 0.1,
            'sync': false
          }
        },
        'line_linked': {
          'enable': true,
          'distance': 150,
          'color': '#ffffff',
          'opacity': 0.4,
          'width': 1
        },
        'move': {
          'enable': true,
          'speed': 3,
          'direction': 'none',
          'random': false,
          'straight': false,
          'out_mode': 'out',
          'attract': {
            'enable': false,
            'rotateX': 600,
            'rotateY': 1200
          }
        }
      },
      'interactivity': {
        'detect_on': 'canvas',
        'events': {
          'onhover': {
            'enable': true,
            'mode': 'grab'
          },
          'resize': true
        },
        'modes': {
          'grab': {
            'distance': 200
          }
        }
      },
      'retina_detect': true
    });

    if (this.props.isRegister && this.datePicker.current) this.renderDatePicker(this.datePicker.current);
  }

  componentDidUpdate() {

    if (null !== this.datePicker.current)
      this.renderDatePicker(this.datePicker.current);
  }

  onSubmit(e) {

    e.preventDefault();

    const datePicker = document.getElementById('datePicker');
    const action = this.props.isRegister ? 'register' : 'login';
    const data = {
      email: this.state.email,
      password: this.state.password
    };

    if ('register' === action) {

      data.name = this.state.name;
      data.dob = datePicker.DatePickerX.getValue(true);
      data.sex = this.state.sex;
      this.setState({ dob: datePicker.DatePickerX.getValue() });
    }

    this.props.authUser(action, data);
  }

  onChange(e) { this.setState({ [e.target.name]: e.target.value }); }

  renderDatePicker(datePicker) {

    const strictAge = new Date(Date.now()).getFullYear() - 10;

    datePicker.DatePickerX.init({
      maxDate: new Date('12/31/' + strictAge),
      minDate: new Date('1/1/' + (strictAge - 200)),
      weekDayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      todayButton: false,
      format: this.props.locale === 'en' ? 'mm/dd/yyyy' : 'dd/mm/yyyy'
    });
    datePicker.addEventListener('click', this.removeError, false);
  }

  setSex(e) {

    this.setState({ sex: e.target.value });
    this.removeError(e);
  }

  removeError(e) {

    const error = this.props.error;

    if ('redirect' === e.target.id && error)
      this.props.removeError();
    else if (error && delete error[e.target.name])
      this.props.setError(error);
  }
}

function Field({ type = 'text', name, value, placeholder, attrs = { autoFocus: false }, onChange, onInput, error, errDict }) {

  return (
    <div className={style.field}>
      <div className={style.control}>
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          className={`${style.input} ${style.isFullwidth} ${style.hasTextGreyLighter}`}
          onChange={onChange}
          onInput={onInput}
          autoComplete="true"
          {...attrs} />
      </div>
      {error && <p className={`${style.help} ${style.isDanger}`}>{errDict[error.message]}</p>}
    </div>
  );
}

function mapStateToProps(state) {

  return {
    auth: state.auth,
    locale: state.metaData.locale,
    error: state.error,
  };
}

export default connect(mapStateToProps, { authUser, setError, removeError })(Auth);