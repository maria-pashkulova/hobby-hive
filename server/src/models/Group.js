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
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    groupAdmin: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }

});

//Create model

const Group = mongoose.model('Group', groupSchema)

//Export model
module.exports = Group;