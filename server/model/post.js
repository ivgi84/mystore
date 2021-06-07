const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const COMMON_CONFIG = {
  type: String,
  required: true
};

const postSchema = new Schema({
  title: COMMON_CONFIG,
  imageUrl: COMMON_CONFIG,
  content: COMMON_CONFIG,
  creator: {
    type: Object,
    required: true
  }
},{ timestamps: true })

module.exports = mongoose.model('Post', postSchema);