const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    city: String,
    location: String,
    status: String,
    groupId: {
        type: mongoose.Types.ObjectId,
        ref: 'Group'
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;