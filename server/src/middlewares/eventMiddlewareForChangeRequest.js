const mongoose = require('mongoose');
const eventService = require('../services/eventService');

const getEventForChangeRequest = async (req, res, next) => {
    const requestedEventId = req.params.eventId;

    //check if event exists 
    if (!mongoose.Types.ObjectId.isValid(requestedEventId)) {
        return res.status(404).json({ message: 'Събитието не съществува!' });
    }

    const event = await eventService.getById(requestedEventId);
    if (!event) {
        return res.status(404).json({ message: 'Събитието не съществува!' });
    }

    req.eventId = requestedEventId;
    req.eventOwnerId = event._ownerId.toString();

    next();
}

module.exports = getEventForChangeRequest;
