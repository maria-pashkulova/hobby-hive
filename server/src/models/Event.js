const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Името на събитието е задължително!']
    },
    color: {
        type: String,
        required: [true, 'Изберете цвят за обозначаване на събитието!']
    },
    description: {
        type: String,
        maxLength: 500,
        trim: true,
        required: [true, 'Описанието на събитието е задължително!']
    },
    specificLocation: {
        name: {
            type: String,
            default: 'Не е зададена локация за събитието'
        },
        locationRegionCity: {
            type: String,
            default: ''
        },
        coordinates: {
            type: [Number],
            default: [],
        }
    },
    start: {
        type: Date,
        required: [true, 'Началната дата на събитието е задължителна!']
    },
    end: {
        type: Date,
        required: [true, 'Крайната дата на събитието е задължителна!']
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
    },
    membersGoing: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }]

}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;