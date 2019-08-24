const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    avatar: {type:String, default: 'http://localhost:8000/default_avatar.png'},
    firstName: {type:String, default: ''},
    lastName: {type:String, default: ''},
    user:{type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Profile', profileSchema);