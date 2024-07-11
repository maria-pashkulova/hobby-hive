const mongoose = require('mongoose');

//Create schema
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    }

}, { timestamps: true });



//Create model

const Message = mongoose.model('Message', messageSchema);

//Export model
module.exports = Message;
