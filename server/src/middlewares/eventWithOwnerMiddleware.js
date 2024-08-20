const mongoose = require('mongoose');
const eventService = require('../services/eventService');

const getEventWithOwner = async (req, res, next) => {
    const { requestedEventId: requestedEventIdFromBody } = req.body;
    const requestedGroupId = req.groupId;


    //When used in changeRequestsController, event id comes from request body
    //When used in eventController for delete event, event id comes from req.params
    const eventId = requestedEventIdFromBody || req.params.eventId;

    //check if event exists 
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(404).json({ message: 'Събитието не съществува!' });
    }

    const event = await eventService.getById(eventId);

    if (!event) {
        return res.status(404).json({ message: 'Събитието не съществува!' });
    }

    //check if requested event belongs to the requested group
    if (event.groupId.toString() !== requestedGroupId) {
        return res.status(400).json({ message: 'Заявеното събитие не е за текущата група' });

    }

    req.eventId = eventId;
    req.eventOwnerId = event._ownerId.toString();

    next();
}

module.exports = getEventWithOwner;
