const mongoose = require('mongoose');

const eventChangeRequestSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    requestFromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    }

}, { timestamps: true }) // time stamps for createdAt

const EventChangeRequest = mongoose.model('EventChangeRequest', eventChangeRequestSchema);

module.exports = EventChangeRequest;