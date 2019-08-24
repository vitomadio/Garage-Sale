const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
    verifyToken: String,
    active: { type: Boolean, default: false },
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});

//ENCRYPT PASSWORD.
userSchema.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

//CHECK IF PASSWORD MATCHES.
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', userSchema);