const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        maxLength: 300,
        required: true
    },
    specificLocation: {
        name: {
            type: String,
            default: 'Не е зададена локация за събитието'
        },
        coordinates: {
            type: [Number],
            default: [],
        }
    },
    start: {
        type: Date,
        required: true
    },
    end: {
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
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;