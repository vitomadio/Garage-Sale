const express = require('express');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const crypto = require('../config-file').crypto;
const config = require('../config-env');

const client = redis.createClient(config.redis_config); //CONFIG REDIS.

const router = express.Router();

const User = require('../models/user');
const Profile = require('../models/profile');

const upload = multer({ dest: 'public/uploads/' }).single('avatar'); //CONFIG MULTER

//UPDATE USER PROFILE.
router.post('/edit', isAuth, upload, (req, res) => {
  // console.log(req.body, req.file.filename);
  if (req.file) {
    const file = req.file;
    const prevUrl = req.body.prevUrl.slice(21);
    const avatar = `${config.baseUrl}/uploads/${file.filename}`;
    Profile.findOneAndUpdate({ user: req.decoded.userId }, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      avatar: avatar
    },{new: true})
      .then(profile => {
        User.findOneAndUpdate({ _id: req.decoded.userId }, {
          userName: req.body.userName,
          email: req.body.email
        }, { new: true }).populate('profile').exec((err, user) => {
          if (!err) {
            if (prevUrl !== '/default_avatar.png') {
              fs.unlink('public' + prevUrl, (err) => { //Remove previous file from storage.
                if (err) return console.log(err);
                console.log('Prev file was deleted.');
              });
            }
            return res.json({ success: true, message: "Your profile changes has been saved.", user: user });
          }
          res.json({ success: false, message: 'Error: ' + err })
        });
      })
      .catch(err => res.json({ success: false, message: 'There has been an error whil profile uploading: ' + err }))
  }
  else {
    Profile.findOneAndUpdate({user: req.decoded.userId }, {
      firstName: req.body.firstName,
      lastName: req.body.lastName
    },{new:true})
      .then(profile => {
        User.findOneAndUpdate({ _id: req.decoded.userId }, {
          userName: req.body.userName,
          email: req.body.email
        }, { new: true }).populate('profile').exec((err, user) => {
          if (!err) return res.json({ success: true, message: "Your profile changes has been saved.", user: user });
          res.json({ success: false, message: "There has been an error: " + err });
        });
      })
      .catch(err => res.json({ success: false, message: 'There has been an error whil profile uploading: ' + err }));
  }
});

module.exports = router;

//-------CUSTOM MIDDLEWARES-------------//
function isAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.json({ success: false, message: 'No token was provided.' });
  //Verify if token is valid.
  jwt.verify(token, crypto, (err, decoded) => {
    if (err) { return res.json({ success: false, message: "Token invalid: " + err }) }; //Send error if invalid token.
    req.decoded = decoded; //Create global variable to use in any request beyond.
    req.oldToken = token;
    client.get(decoded.userId, (err, invalidToken) => { //Check if token is whitelisted (was never logout in 24 hours);
      if (err) return console.log("Error: " + err);
      if (invalidToken === token) {
        return res.json({ success: false, message: 'Token is invalid' })
      }
      next();
    });
  });
};