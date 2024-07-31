import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  rol: {
    type: String
  },
  phone1: {
    type: String
  },
  phone2: {
    type: String
  },
  phone3: {
    type: String
  },
  phone4: {
    type: String
  }
});

const User = mongoose.model('User', userSchema);

export default User;
