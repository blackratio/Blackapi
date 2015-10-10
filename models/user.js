var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// USER SCHEMA
// =============================================================================

var UserSchema = new Schema({
   name: String,
   age: Number,
   email: String,
   birthDate: Date
});

module.exports = mongoose.model('User', UserSchema);
