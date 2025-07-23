const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Token', tokenSchema);