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
    imageUrl: String

});

//Create model

const Group = mongoose.model('Group', groupSchema)

//Export model
module.exports = Group;