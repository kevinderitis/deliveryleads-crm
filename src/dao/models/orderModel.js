import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  quantity: {
    type: Number,
    min: 0
  },
  email: {
    type: String
  },
  delivered: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

orderSchema.statics.findWithClientInfo = async function () {
  return this.aggregate([
    {
      $lookup: {
        from: 'clients',
        localField: 'email',
        foreignField: 'email',
        as: 'clientInfo'
      }
    },
    {
      $unwind: '$clientInfo'
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $addFields: {
        'clientInfo.tgchatid': '$clientInfo.tgchatid',
        'clientInfo.name': '$clientInfo.name',
        'clientInfo.phone': '$clientInfo.phone'
      }
    }
  ]);
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
