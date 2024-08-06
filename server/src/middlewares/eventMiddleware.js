const mongoose = require('mongoose');
const eventService = require('../services/eventService');

//Check if requested event is valid
//Attach event to req object

//TODO: идеята ми е извлечения event да се ползва в event details, update event
// и в Моят календар

const getEvent = async (req, res, next) => {
    const requestedEventId = req.params.eventId;

    //check if event exists 
    if (!mongoose.Types.ObjectId.isValid(requestedEventId)) {
        return res.status(404).json({ message: 'Събитието не съществува!' });
    }

    const event = await eventService.getByIdToValidate(requestedEventId);
    if (!event) {
        return res.status(404).json({ message: 'Събитието не съществува!' });
    }

    req.event = event;
    next();
}

module.exports = getEvent;
