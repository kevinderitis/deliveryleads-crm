import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
    unique: true
  },
  isSent: {
    type: Boolean,
    default: false
  }
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
