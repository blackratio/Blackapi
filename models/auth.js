var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// USER AUTH SCHEMA
// =============================================================================

var UserAuth = new Schema({
   name: String,
   password: String,
   admin: Boolean
});

module.exports = mongoose.model('UserAuth', UserAuth);
