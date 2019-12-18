/**
 * @param {object} request {url, method, data, headers, ...}
 * @returns Promise<?>
 */
export default function ajax(request) {

  return new Promise((resolve, reject) => {

    const xhr = new XMLHttpRequest();

    const { url, method, data, headers } = standardizeRequest(request);

    xhr.addEventListener('readystatechange', () => { if (4 === xhr.readyState) resolve(xhr) }, false);
    xhr.addEventListener('error', () => reject(xhr), false);

    xhr.open(method, url, true);
    if (headers.length > 0)
      for (let i = 0; i < headers.length; ++i)
        xhr.setRequestHeader(headers[i].name, headers[i].value);
    xhr.send(data);
  });
}

function standardizeRequest({ url, method = 'GET', data, headers = [], cors = false } = {}) {

  if (cors) {
    const proxy = 'https://cors-anywhere.herokuapp.com/';
    url = proxy + url;
  }

  if (headers.length > 0) {
    for (let i = headers.length; --i >= 0;) {

      const [name, value] = headers[i].split(':');
      headers[i] = { name: name.trim().toLowerCase(), value: value.trim() };
    }
  }

  return { url, method: method.toUpperCase(), data, headers };
}