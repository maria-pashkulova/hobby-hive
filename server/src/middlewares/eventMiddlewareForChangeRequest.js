const mongoose = require('mongoose');
const eventService = require('../services/eventService');

const getEventForChangeRequest = async (req, res, next) => {
    const { requestedEventId } = req.body;
    const requestedGroupId = req.groupId;

    //check if event exists 
    if (!mongoose.Types.ObjectId.isValid(requestedEventId)) {
        return res.status(404).json({ message: 'Събитието не съществува!' });
    }

    const event = await eventService.getById(requestedEventId);

    if (!event) {
        return res.status(404).json({ message: 'Събитието не съществува!' });
    }

    //check if requested event belongs to the requested group
    if (event.groupId.toString() !== requestedGroupId) {
        return res.status(400).json({ message: 'Заявеното събитие не е за текущата група' });

    }

    req.eventId = requestedEventId;
    req.eventOwnerId = event._ownerId.toString();

    next();
}

module.exports = getEventForChangeRequest;
