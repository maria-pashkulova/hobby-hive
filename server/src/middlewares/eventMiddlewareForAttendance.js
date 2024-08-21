const mongoose = require('mongoose');
const eventService = require('../services/eventService');

const getEventForAttendance = async (req, res, next) => {
    const requestedEventId = req.params.eventId;

    //check if event exists 
    if (!mongoose.Types.ObjectId.isValid(requestedEventId)) {
        return res.status(404).json({ message: 'Събитието не съществува!' });
    }

    const event = await eventService.getByIdToValidateForAttendance(requestedEventId);
    if (!event) {
        return res.status(404).json({ message: 'Администраторът на групата е изтрил събитието, за което правите заявка' });
    }

    req.event = event;
    next();
}

module.exports = getEventForAttendance;
