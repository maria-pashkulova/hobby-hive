const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    city: String,
    location: String,
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
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;