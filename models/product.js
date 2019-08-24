const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./comment');


const productSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    image: String,
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

module.exports = mongoose.model('Product', productSchema);