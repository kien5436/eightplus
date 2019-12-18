const crypto = require('crypto');

/* if 'salt' is not provided, create new password,
	else verify password
 */
module.exports = (pwd, salt = crypto.randomBytes(100).toString('base64')) => {

  return {
    password: crypto.pbkdf2Sync(pwd, salt, 100, 64, 'sha512').toString('hex'),
    salt: salt
  };
}