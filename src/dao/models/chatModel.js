import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: {
    type: String
  },
  to: {
    type: String
  },
  text: {
    type: String
  },
  image: {
    type: String
  },
  audioUrl: {
    type: String
  }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  participants: {
    type: [String],
    required: true
  },
  messages: [messageSchema],
  tags: {
    type: [String]
  },
  nickname: {
    type: String
  },
  username: {
    type: String
  },
  client: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  fanpageId: {
    type: String
  },
  status: {
    type: String,
    default: 'active'
  },
  type: {
    type: String
  }

}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
