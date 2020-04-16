var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var adminSchema = new Schema({

  usuario: { type: String},
  password: { type: String}

});
// export
module.exports = mongoose.model('Admin', adminSchema);
