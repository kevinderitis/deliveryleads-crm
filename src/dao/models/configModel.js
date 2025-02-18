import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'default',
    },
    whatsapp: {
        type: String
    },
});

const Config = mongoose.model('Config', configSchema);

export default Config;
