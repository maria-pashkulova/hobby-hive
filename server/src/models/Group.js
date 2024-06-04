const mongoose = require('mongoose');

//Create schema
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: String,
    description: String,
    location: String,
    imageUrl: String,
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, { timestamps: true });

//Create model

const Group = mongoose.model('Group', groupSchema)

//Export model
module.exports = Group;