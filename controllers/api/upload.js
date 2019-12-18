const router = require('express').Router();
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const os = require('os');

const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve('uploads'),
    filename: function(req, file, cb) { cb(null, file.originalname); }
  })
});

router.post('/', upload.array('avatar', 26), (req, res, next) => {

  // const avatar = req.files;
  // const delimiter = os.platform() === 'win32' ? '\\' : '/';

  // 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('').forEach(letter => {

  //   sharp(path.resolve('uploads/images/avatars', '_' + letter + '.png'))
  //     .resize(128, 128)
  //     .toFile(path.resolve('uploads/images/avatars', '_' + letter + 'x128.png'));
  //   sharp(path.resolve('uploads/images/avatars', '_' + letter + '.png'))
  //     .resize(96, 96)
  //     .toFile(path.resolve('uploads/images/avatars', '_' + letter + 'x96.png'));
  //   sharp(path.resolve('uploads/images/avatars', '_' + letter + '.png'))
  //     .resize(32, 32)
  //     .toFile(path.resolve('uploads/images/avatars', '_' + letter + 'x32.png'));
  //   sharp(path.resolve('uploads/images/avatars', '_' + letter + '.png'))
  //     .resize(64, 64)
  //     .toFile(path.resolve('uploads/images/avatars', '_' + letter + 'x64.png'));
  // });

  // for (const file of avatar) {

  //   const newPath = [file.destination, 'images', 'avatars', '_' + file.filename].join(delimiter);

  //   if (fs.existsSync(file.path)) {

  //     fs.mkdir(path.resolve('uploads', 'images', 'avatars'), { mode: 766 }, err => {

  //       if (err && err.code !== 'EEXIST') throw err;

  //       fs.rename(file.path, newPath, async (err) => {

  //         if (err) throw err;

  //       });
  //     });
  //   }
  // }
  res.sendStatus(201)
})

module.exports = router;