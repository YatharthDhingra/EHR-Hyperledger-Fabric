const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'must provide name'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'must provide password']
  },
  org : {
    type: String,
    required: [true, 'must provide organisation']
  },
  role : {
    type : String,
    required : [true, 'must provide role']
  },
  firstName : {  //for doctors
    type : String,
    required : false
  },
  lastName : {
    type : String,
    required : false
  },
  speciality : {
    type : String,
    required : false
  }
})

module.exports = mongoose.model('Collection', schema)