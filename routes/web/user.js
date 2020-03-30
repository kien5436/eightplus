const router = require('express').Router();
const cookieParser = require('cookie-parser')(process.env.COOKIE_SECRET);
const { Types } = require('mongoose');

const identify = require('../../controllers/middleware/identify');
const i18n = require('../../helpers/i18n');
const extractAssets = require('../../helpers/extract-assets');
const User = require('../../models/user');
const show404 = require('../../helpers/404');
const formatDate = require('../../helpers/format-date');
const { loadProfile } = require('../../controllers/web/user');
const rootUrl = `${process.env.HOST}:${process.env.PORT}/files`;

router
  .get('/:id', [cookieParser, identify], loadProfile)

module.exports = router;