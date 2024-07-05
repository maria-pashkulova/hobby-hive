const Event = require('../models/Event');
const Group = require('../models/Group');


exports.getAllGroupEvents = (groupId) => {
    // const events = Event.find({
    //     start: { $gte: start.toDate() },
    //     end: { $lte: end.toDate() }
    // })

    const events = Event.find({ groupId }).lean();

    return events;
}

//status?
exports.create = async (name, description, specificLocation, time, groupId, _ownerId) => {

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

    //TODO: дали таговете които са зададени отговарят на таговете на текущата група и дали са валидни

    //TODO: валидна дата която е преди текущото време

    //TODO: add validation here
    const newEventData = {

        name,
        description,
        specificLocation,
        time,
        groupId,
        _ownerId
    }
    const newEvent = Event.create(newEventData);

    return newEvent;

}
