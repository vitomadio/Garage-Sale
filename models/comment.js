const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const commentSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  seller: { type: Schema.Types.ObjectId, ref: 'User' },
  buyer: { type: Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  timeStamp: { type: Date, default: Date.now },
  reply: {type: Object, default: {}}
});

commentSchema.pre('deleteOne', (next) => {
  User.findOneAndUpdate({ _id: this.buyer }, { $pull: { comments: this.commentSchema } }, next);
})

module.exports = mongoose.model('Comment', commentSchema);