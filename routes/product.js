const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const crypto = require('../config-file').crypto;
const redis = require('redis');
const config = require('../config-env');

const User = require('../models/user');
const Product = require('../models/product');
const Comment = require('../models/comment');

//CONFIGURE MULTER.
const upload = multer({ dest: 'public/uploads/' }).single('file');

// CONFIG REDIS
const client = redis.createClient(config.redis_config);


const router = express.Router();
router.use(isAuth);

//GET ALL PRODUCTS.
router.get('/', (req, res) => {
  Product.find({}).populate({
    path: 'user',
    select: 'userName email -_id',
    populate: {
      path: 'profile', select: 'avatar'
    }
  })
    .then(products => {
      if (!products) return res.json({ success: true, message: "There's no product to show." });
      return res.json({ success: true, products: products });
    })
    .catch(err => res.json({ success: false, message: "There has been an error getting products. " + err }));
});

//GET A PRODUCT.
router.get('/:id', (req, res) => {
  Product.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'userName email -_id',
      populate: {
        path: 'profile',
        select: 'avatar'
      }
    })
    .then(product => {
      if (!product) return res.json({ success: true, message: "There's no product to show." });
      res.json({ success: true, product: product });
    })
    .catch(err => res.json({ success: false, message: "There has been an error getting product details. " + err }));
});

//GET USER PRODUCTS.
router.get('/my-products', (req, res) => {
  const io = req.app.get('socketIo');//Definning io
  Product.find({ user: req.decoded.userId })
    .then(products => {
      if (!products) return res.json({ success: true, message: "There's no product to show." });
      res.json({ success: true, products: products });
    })
    .catch(err => res.json({ success: false, message: "There has been an error: " + err }));
});

//SAVE A PRODUCT.
router.post('/save', upload, (req, res) => {
  if (req.file) {
    const file = req.file;
    const image = `${config.baseUrl}/uploads/${file.filename}`;
    const newProduct = new Product({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      image: image,
      user: req.decoded.userId,
      longitude: req.body.longitude,
      latitude: req.body.latitude
    });
    newProduct.save()
      .then(product => {
        if (!product) return res.json({ success: true, message: "Something wrong happened while publish your product." });
        res.json({ success: true, message: "Your new product was publish!", product: product });
        //Sends socket to client and refresh products lists in all active sesssions.
        let io = req.app.get('socketIo');
        io.emit('refresh products', { message: 'Product Deleted.' });
      })
      .catch(err => res.json({ success: false, message: "There has been an error: " + err }));
  }
});

//DELETE PRODUCT.
router.delete('/delete-product/:id', (req, res) => {
  Product.findOneAndDelete({ _id: req.params.id, user: req.decoded.userId })
    .then((product) => {
      if (!product) return res.json({ success: true, message: "There's no product to delete." })
      Comment.find({ _id: { $in: product.comments } })
        .then(comments => {
          if (!comments) return res.json({ success: true, message: "There's no comments to delete." })
          comments.forEach(comment => {
            User.findOneAndUpdate({ _id: comment.buyer }, { $pull: { comments: comment._id } })
              .then(user => {
                if(!user)return console.log('User not found.')
                comment.remove();
              })
              .catch(err => console.log(err));
          });
          //Sends socket to client and refresh products lists in all active sesssions.
          let io = req.app.get('socketIo');
          io.emit('refresh products', { message: 'Product Deleted.' });
          res.json({ success: true, message: "Your product has been successfully deleted." })
        })
        .catch(err => res.json({ success: false, message: "There has been an error while deleting the product: " + err }));
    })
    .catch(err => res.json({ success: false, message: "There has been an error: " + err }));
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
        return res.json({ success: false, message: 'Token is invalid' });
      }
      next();
    });
  });
};