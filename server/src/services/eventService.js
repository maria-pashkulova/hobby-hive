const Event = require('../models/Event');
const Group = require('../models/Group');
const { checkForDuplicateTags } = require('../utils/validateGroupData');
const { validateEventTags } = require('../utils/validateEventData');


exports.getAllGroupEvents = (groupId) => {
    // const events = Event.find({
    //     start: { $gte: start.toDate() },
    //     end: { $lte: end.toDate() }
    // })

    const events = Event.find({ groupId }).lean();

    return events;
}

//status?
exports.create = async (name, description, specificLocation, time, activityTags, groupId, _ownerId) => {

    const group = await Group.findById(groupId);

    //Group exists and current user is a member of the group - guaranteed by middlewaresp

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
