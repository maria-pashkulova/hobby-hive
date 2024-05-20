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
    members: Number,
    imageUrl: String,
    events: [{
        // mongoose.Schema.Types.ObjectId - 2н.
        type: mongoose.Types.ObjectId,
        ref: 'Event'
    }]

});

//Create model

const Group = mongoose.model('Group', groupSchema)

//Export model
module.exports = Group;