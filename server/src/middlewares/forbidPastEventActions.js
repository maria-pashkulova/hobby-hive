const eventService = require('../services/eventService');
const { checkIsFutureEvent } = require('../utils/validateEventData');

const forbidPastEventActions = async (req, res, next) => {
    const eventId = req.eventId //comes from eventWithOwnerMiddleware

    const eventWithStartDate = await eventService.getByIdToValidatePastEventActions(eventId);

    if (!checkIsFutureEvent(eventWithStartDate.start)) {
        return res.status(400).json({ message: 'Събитието е вече започнало или е минало! Заявеното действие е не е възможно!' });
    }

    next();

}

module.exports = forbidPastEventActions;