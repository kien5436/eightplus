import React from 'react';

import i18n from 'i18n';

function FilterTabs({ darkMode, tabList, style }) {

  const tabs = [];

  for (const id in tabList) {

    if (tabList.hasOwnProperty(id)) {

      const tab = tabList[id];

      tabs.push(
        <li key={id} data-tab-id={id} className={tab.isActive ? style.isActive : ''} onClick={1}>
          <a href="#" className={darkMode ? (tab.isActive ? style.hasTextDanger : style.hasTextGreyLight) : ''}>{tab.text}</a>
        </li>);
    }
  }

  return (
    <div className={`${style.tabs} ${style.isCentered} ${style.isSmall}`}>
      <ul>{tabs}</ul>
    </div>
  );
}

function SearchBar({ darkMode, locale, hasFilter = false, style, trackSearch, onSearch }) {

  const dict = i18n(locale, 'contacts');

  function onChange(e) { trackSearch(e.target.value); }

  return (
    <section className={style.section}>
      <form id={style.searchEverything} onSubmit={onSearch}>
        <div className={`${style.field} ${style.hasAddons}`}>
          <div className={style.control}>
            <input
              className={style.input}
              type="text"
              name="searchBar"
              placeholder={dict.searchBar}
              onChange={onChange}
              onFocus={(e) => (e.target.setSelectionRange(0, e.target.value.length))} />
          </div>
          <div className={style.control}>
            <button type="submit" className={style.button}>
              {/* <span className={`${style.icon} ${style.isRight}`}> */}
              <i className={`${style._icon} ${style.iconSearch}`}></i>
              {/* </span> */}
            </button>
          </div>
        </div>
      </form>
      {hasFilter && <FilterTabs style={style} darkMode={darkMode} locale={locale} tabList={{
        'friends': { isActive: true, text: dict.friends },
        'requested': { text: dict.requested },
        'sentRequest': { text: dict.sentRequest },
        'blocked': { text: dict.blocked },
      }} />}
    </section>
  );
}

export default SearchBar;