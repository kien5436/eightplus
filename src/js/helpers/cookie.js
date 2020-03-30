export function getCookie(cname) {

  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');

  for (let cookie of cookies) {

    while (cookie.charAt(0) == ' ') cookie = cookie.substring(1);

    if (cookie.indexOf(name) == 0)
      return cookie.substring(name.length, cookie.length);
  }
  return '';
}