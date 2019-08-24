const express = require('express');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const config = require('../config-env');
const crypto = require('../config-file').crypto;
const uuidv = require('uuidv4');

const User = require('../models/user');
const Profile = require('../models/profile');

// CONFIG REDIS
// We used Redis to blacklist logged out tokens, in order to avoid hacking with stealed sessions tokens.
const client = redis.createClient('redis://redis:6379');


//NODEMAILER CONFIG.
const { google } = require('googleapis'); //import googleapi OAuth for nodemailer
const OAuth2 = google.auth.OAuth2;

//Configure nodemailer
let oauth2Client = new OAuth2(
  config.client_id,
  config.client_secret,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({ //Set refresh token
  refresh_token: config.refresh_token
});

let accessToken = ""; //Initialize an access token variable


oauth2Client.getRequestHeaders(function (err, tokens) { //Get the access token
  accessToken = tokens.access_token;
});

let smtpTransport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: config.user,
    clientId: config.client_id,
    clientSecret: config.client_secret,
    refreshToken: config.refresh_token,
    accessToken: accessToken
  }
});

const router = express.Router();

//REGISTER
router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }) //Check if users already exists.
    .then(response => {
      if (!response) {
        const token = jwt.sign({ data: 'token' }, crypto, { expiresIn: 24 * 60 * 60 }); //Generate token to verify account.
        const newUser = new User;
        newUser.userName = req.body.userName,
          newUser.email = req.body.email,
          newUser.password = newUser.encryptPassword(req.body.password),
          newUser.verifyToken = token
        return newUser.save() //Save new user.
          .then(user => {
            const newProfile = new Profile({
              user: user._id
            });
            //Create new user profile.
            newProfile.save()
              .then(profile => {
                user.profile = profile._id;
                user.save();
              })
              .catch(err => console.log(err));
            //Send confirmation email.
            const mailOptions = {
              to: req.body.email,
              from: 'account_verification@garage-sales.com',
              subject: 'Account verification',
              html: '<h3>Welcome to Garage Sales!</h3>\n\n' +
                '<p>Please click on the following link to compleate the process.</p>\n\n' +
                '<form action="http://localhost:8000/auth/verify" method="post"> \n\n' +
                '<input type="hidden" name="token" value="' + token + '"> \n\n' +
                '<button type="submit" href="/localhost:8000">Verify Email</button> \n\n' +
                '</form> \n\n'
            };
            smtpTransport.sendMail(mailOptions, (err) => {
              if (!err) {
                return res.json({ success: true, message: 'Please check your email and follow the instructions to verify your account.' });
              }
              res.json({success:false,message:"There has been an error while send the verification email."})
            })
          })
          .catch(err => res.json({ success: false, message: err }));
      }
      res.json({ success: false, message: 'This email has already been used.' });
    })
    .catch(err => res.json({ success: false, message: err }));
});

//VERIFY TOKEN FOR EMAIL CONFIRMATION.
router.post('/verify', (req, res) => {
  User.findOne({ verifyToken: req.body.token })
    .then(user => {
      if (!user) {
        return res.json({ success: false, message: 'Something went wrong, please try again later.' });
      }
      user.updateOne({ verifyToken: null, active: true}, (err, updateUser) => {
        if (!err) return res.redirect('http://localhost:8000');
        res.json({ success: false, message: err });
      });
    })
    .catch(err => res.json({ success: false, message: 'Something went wrong, please try again later.', error: err }));
});

//LOGIN
router.post('/login', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.json({ success: false, message: 'Email and password must be provided' });
  }
  User.findOne({ email: req.body.email })
  .populate('profile')
  .populate(
    {
      path: 'comments',
      populate: {
        path: 'product' }
    })
    .then(user => {
      if (!user) return res.json({ success: false, message: "User doesn't exist, please check your username and try again." });
      const validPassword = user.validatePassword(req.body.password);
      if (!validPassword) return res.json({ success: false, message: "Wrong password, please try again!" });
      if (user.active) {
        return generateNewToken(user._id) //Generate new token for the user.
          .then(token => {
            return res.json({ success: true, token: token, user: user });
          })
          .catch(err => console.log(err));
      }
      res.json({ success: false, message: 'You need to activate your account, please check your email an follow the instructions.' });
    })
    .catch(err => console.log(err));
});

//LOGOUT USER, ADD TOKEN TO UNAUTHORIZED TOKENS LIST WITH REDIS.
router.get('/logout', isAuth, (req, res) => {
  const token = req.headers.authorization;
  const userId = req.decoded.userId
  client.set(userId, token);
});

//GET SESSION USER.
router.get('/session', isAuth, (req, res) => {
  console.log('session');
  User.findById(req.decoded.userId, {_id:0})
  .populate('profile')
  .populate({path:'comments',populate: {path:'product'}})
    .then(user => {
      const oldToken = req.oldToken;
      const userId = req.decoded.userId
      client.set(userId.toString(), oldToken); //Add old token to blacklist so it couldn't be used again by third parties.
      if (!user) return res.json({ success: false });
      generateNewToken(userId)
        .then(token => {
          res.json({ success: true, user: user, token: token });
        })
        .catch(err => console.log(err));
    });
});

module.exports = router;

//-------CUSTOM MIDDLEWARES-------------//

//GET SESSION MIDDLEWARE.
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
        return res.json({ success: true, message: 'Token is invalid' })
      }
      next();
    });
  });
};

//GENERATES NEW TOKEN.
const generateNewToken = (userId) => new Promise((resolve, reject) => {
  const token = jwt.sign({ userId: userId, uuidv: uuidv() }, crypto, { expiresIn: 24 * 60 * 60 });
  try{
    if (token) {
      return resolve(token)
    }
    return reject("something happened")
  } catch (err) { throw err }
});