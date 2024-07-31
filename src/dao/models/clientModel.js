import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String
  },
  password: {
    type: String
  },
  state: {
    type: Boolean,
    default: true
  },
  tgchatid: {
    type: String
  },
  tgadmin: {
    type: String
  },
  textmessage: {
    type: String
  },
  nickname: {
    type: String
  },
  sheet: {
    type: String
  }
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
