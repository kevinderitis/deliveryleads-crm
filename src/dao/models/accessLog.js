import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema({
    userAgent: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const AccessLog = mongoose.model('AccessLog', accessLogSchema);

export default AccessLog;