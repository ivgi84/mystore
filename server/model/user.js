const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const baseFieldConfig = { 
  type: String,
  required: true
};

const userSchema = new Schema({
  email:baseFieldConfig,
  password:baseFieldConfig,
  name:baseFieldConfig,
  status:{
    type: String,
    default: 'I am New'
  },
  posts:[{
    type: Schema.Types.ObjectId, // referance to post
    ref: 'Post'
  }]
});

module.exports = mongoose.model('User', userSchema);