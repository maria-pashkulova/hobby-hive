const mongoose = require('mongoose');

//Create schema
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    description: String,
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    imageUrl: String,
    members: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            fullName: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            profilePic: {
                type: String
            }

        }
    ],
    activityTags: [{
        type: String,
        unique: true
    }],
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, { timestamps: true });


// groupSchema.virtual('membersCount').get(function () {
//     return this.members.length
// });

//Create model

const Group = mongoose.model('Group', groupSchema)

//Export model
module.exports = Group;