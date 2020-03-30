import React from 'react';
import { NavLink } from 'react-router-dom';

import i18n from 'i18n';
import { lightLogo, darkLogo } from '../../helpers/favicon';

function menuItem({ key, url, text, iconName, darkMode, name, style }) {

  let item = (
    <span className={`${style.icon} ${style.isSize4} ${style.isMedium}
    ${darkMode ? ` ${style.hasTextGreyLight}` : ` ${style.hasTextLight}`}
    ${['chat', 'contacts'].includes(name) ? ` ${style.hasBadgeBottom} ${style.hasBadgeDanger} ${style.hasBadgeRounded}` : ''}
      `}>
      <i className={`${style._icon} ${style['icon' + iconName]}`}></i>
    </span>);

  if ('home' === name)
    item = (
      <figure className={`${style.image} ${style.is32x32}`}>
        <img src={darkMode ? darkLogo : lightLogo} />
      </figure>
    );

  return (
    <li key={key}>
      <NavLink
        to={url}
        className={`${style.tooltip} ${style.hasTooltipRight}${darkMode ? ` ${style.isTooltipBlue4}` : ''}`}
        activeClassName={style.isActive}
        data-tooltip={text}>
        {item}
      </NavLink>
    </li >
  );
}

function NavBar({ auth, darkMode, locale, style }) {

  const dict = i18n(locale, 'aside');
  const menuItems = [
    {
      url: '/' + (auth.isAuthenticated && auth.uid),
      text: dict.profile,
      iconName: 'User',
      name: 'profile',
    }, {
      url: '/',
      text: dict.home,
      name: 'home',
    }, {
      url: '/t',
      text: dict.message,
      iconName: 'Chat',
      name: 'chat',
    }, {
      url: '/' + (auth.isAuthenticated && auth.uid) + '/contacts',
      text: dict.contacts,
      iconName: 'Contacts',
      name: 'contacts',
    }, {
      url: '#',
      text: dict.settings,
      iconName: 'Cog',
      name: 'settings',
    }];
  const menu = [];

  if (auth.isAuthenticated)
    for (let i = 0; i < 5; i++)
      menu.push(menuItem({ ...menuItems[i], key: i, style, darkMode }));
  else
    menu.push(menuItem({ ...menuItems[1], key: 0, style }));

  return (
    <aside className={style.menu}>
      <ul className={style.menuList}>
        {menu}
      </ul>
    </aside>
  );
}

export default NavBar;