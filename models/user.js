/*
 * Represents a player in the game
 * @param name [String]: old state to intialize the new state
 */
var config = require('../config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

/*
 * User Schema
 */

var UserSchema = new Schema({
  username: {type: String, required: true, unique: true },
  password: String
});

//var User = mongoose.model('User', UserSchema);
UserSchema.plugin(passportLocalMongoose);
 
//module.exports.user = User;
module.exports = mongoose.model('User', UserSchema);