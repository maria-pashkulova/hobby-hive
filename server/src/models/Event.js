const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    city: String,
    location: String,
    groupId: {
        type: mongoose.Types.ObjectId,
        ref: 'Group'
    },
    _ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;