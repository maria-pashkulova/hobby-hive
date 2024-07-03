const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: String,
    description: {
        type: String,
        maxLength: 300
    },
    specificLocation: {
        name: String,
        coordinates: {
            type: [Number]
        }
    },
    time: {
        type: Date,
        required: true
    },
    activityTags: {
        type: [String],
        default: []
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
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;