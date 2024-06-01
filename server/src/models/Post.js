const mongoose = require('mongoose');

//Create schema
const postSchema = new mongoose.Schema({
    text: {
        type: String,
        maxLength: 700
    },
    img: {
        type: String
    },

    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    _ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, { timestamps: true });



//Create model

const Post = mongoose.model('Post', postSchema);

//Export model
module.exports = Post;
