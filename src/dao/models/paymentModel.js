import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;