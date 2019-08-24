const jwt = require('jsonwebtoken');
const crypto = require('../config-file').crypto;
const redis = require('redis');


const express = require('express');
const Comment = require('../models/comment');
const User = require('../models/user');
const Product = require('../models/product');

// CONFIG REDIS
const client = redis.createClient('redis://redis:6379');

const router = express.Router();
//Config isAuth middleware.
router.use(isAuth);

//GET CURRENT USER COMMENTS.
router.get('/user-comments', (req, res) => {
  Comment.find({ buyer: req.decoded.userId }, { seller: 0 }).sort({ timeStamp: -1 })
  .populate({ path: 'product'})
    .then(comments => {
      if (!comments) return res.json({ success: true, message: "There're no comments to show." });
      res.json({ success: true, comments: comments });
    })
    .catch(err => res.json({ success: false, message:"There was an error looking for comments: " + err}));
});

//GET ALL COMMENTS OF A PRODUCT.
router.get('/:productId', (req, res) => {
  Comment.find({ product: req.params.productId }, { seller: 0 }).sort({ timeStamp: -1 })
    .populate({ path: 'buyer', select: 'email userName -_id', populate: { path: 'profile', select: 'avatar firstName lastName' } })
    .then(comments => {
      if (!comments) return res.json({ success: true, message: "There's no comments for this product." });
      res.json({ success: true, comments: comments });
    })
    .catch(err => res.json({ success: false, message: "There has been an error finding comments: " + err }));
});

//ADD NEW COMMENT.
router.post('/add-comment', (req, res) => {
  User.findOne({ email: req.body.buyer }).populate('profile', 'avatar').exec((err, user) => {
    if (err) return res.json({ success: true, message: "There has been an error finding the user." + err });
    if (!user) return res.json({ success: true, message: "There's no user with that email." });

    const newComment = new Comment({
      product: req.body.product,
      seller: req.decoded.userId,
      buyer: user._id,
      message: req.body.message
    });
    newComment.save((err, comment) => {
      if (err) return res.json({ success: true, message: "There has been an error saving new comment." + err });
      user['comments'].push(comment);
      user.save();
      Product.findOneAndUpdate({ _id: req.body.product }, { $push: { comments: comment } }, { new: true }, (err, product) => {
        if (err) return res.json({ success: true, message: "There has been an error updating product comments" + err });
        Comment.find(comment).populate({ path: 'buyer', select: 'email', populate: { path: 'profile' } }).exec((err, payload) => {
          if (err) return res.json({ success: true, message: "There has been an error getting comment" + err });
          let io = req.app.get('socketIo');
          io.emit('add comment', { product: product });
          res.json({ succes: true, comment: payload });
        })
      });
    });
  });
});

//REPLY COMMENT
router.post('/reply', (req, res) => {
  Comment.findOneAndUpdate({ _id: req.body.commentId }, { $set: { reply: { message: req.body.replyMessage, timeStamp: new Date() } } }, { new: true })
    .populate({path: 'product'})
    .then(comment => {
      if (!comment) return res.json({ success: true, message: "Can't reply to the user" });
      let io = req.app.get('socketIo');
      io.emit('add comment', { product: comment.product });
      res.json({ success: true, comment: comment });
    })
    .catch(err => res.json({ success: false, message: "There is an error: " + err }));
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
