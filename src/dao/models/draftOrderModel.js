import mongoose from 'mongoose';

const draftOrderSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    min: 0
  },
  email: {
    type: String
  },
  approved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Draft = mongoose.model('Draft', draftOrderSchema);

export default Draft;
