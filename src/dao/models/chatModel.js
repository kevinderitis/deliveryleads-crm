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
  }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  participants: {
    type: [String],
    required: true
  },
  messages: [messageSchema]

}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
