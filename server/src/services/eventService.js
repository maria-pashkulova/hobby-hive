const Event = require('../models/Event');
const Group = require('../models/Group');
const { checkForDuplicateTags } = require('../utils/validateGroupData');
const { validateEventTags } = require('../utils/validateEventData');


exports.getAllGroupEvents = (groupId) => {
    // const events = Event.find({
    //     start: { $gte: start.toDate() },
    //     end: { $lte: end.toDate() }
    // })

    //TODO: check if group id is valid and if the current user is a member 
    const events = Event.find({ groupId }).lean();

    return events;
}

//status?
exports.create = async (name, description, specificLocation, time, activityTags, groupId, _ownerId) => {

    const group = await Group.findById(groupId);

    if (!group) {
        const error = new Error('Несъществуваща група за създаване на събитие!');
        error.statusCode = 404;
        throw error;
    }

    // проверка дали този който се опитва да създаде събитие е член на групата
    const isMember = group.members.find(member => member._id.toString() === _ownerId)

    if (!isMember) {
        const error = new Error('Не сте член на групата, за да създавате събития в нея!');
        error.statusCode = 403;
        throw error;
    }

    //TODO : валидиране на specificLocation - задължително трябва да има name и lat, lon

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
        name,
        description,
        specificLocation,
        time,
        activityTags,
        groupId,
        _ownerId
    }
    const newEvent = Event.create(newEventData);

    return newEvent;

}
