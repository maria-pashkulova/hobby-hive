const Event = require('../models/Event');
const Group = require('../models/Group');
const { checkForDuplicateTags } = require('../utils/validateGroupData');
const { validateEventTags } = require('../utils/validateEventData');


exports.getAllGroupEvents = (groupId, startISO, endISO) => {

    let query = { groupId }

    if (startISO && endISO) {
        query = {
            groupId,
            $or: [
                {
                    //Events fully within the range
                    start: { $gte: startISO },
                    end: { $lte: endISO }
                },
                {
                    //Events starting before the range but ending within it
                    start: { $lt: startISO },
                    end: { $gte: startISO }
                },
                {
                    //Events starting within the range but ending after it:
                    start: { $lte: endISO },
                    end: { $gt: endISO }
                }
            ]
        }
    }
    const events = Event.find(query).lean();

    return events;
}


exports.create = async (title, color, description, specificLocation, start, end, activityTags, groupId, _ownerId) => {

    const group = await Group.findById(groupId);

    //Group exists and current user is a member of the group - guaranteed by middlewares

    //Check if there is an event in current group calendar with the same color
    const existingEvent = await Event.findOne({ color, groupId });
    if (!!existingEvent) {
        const error = new Error('В груповия календар съществува събитие, обозначено с посочения цвят. Изберете друг цвят!');
        error.statusCode = 400;
        throw error;
    }

    //TODO : валидиране на specificLocation - задължително трябва да има name и lat, lon и да бъде в рамките на областния град, 
    //зададен като основна локация за групата

    //Check if event's activityTags are unique (client input itself)
    checkForDuplicateTags(activityTags)

    //TODO: дали таговете които са зададени отговарят на таговете на текущата група
    if (!validateEventTags(group.activityTags, activityTags)) {
        const error = new Error('Невалидни тагове за групова активност за текущата група!');
        error.statusCode = 400;
        throw error;
    }

    //TODO: валидна дата която е преди текущото време

    //TODO: add validation here
    const newEventData = {
        title,
        color,
        description,
        specificLocation,
        start,
        end,
        activityTags,
        groupId,
        _ownerId
    }

    let newEvent = await Event.create(newEventData);

    //Populated group info is needed for notifications
    newEvent = await newEvent
        .populate({
            path: 'groupId',
            select: 'name members._id'
        });

    return newEvent;

}
