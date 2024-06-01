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

//city, location, status
exports.create = async (title, description, city, location, groupId, _ownerId) => {

    const group = await Group.findById(groupId);

    if (!group) {
        const error = new Error('Несъществуваща група за създаване на публикация!');
        error.statusCode = 404;
        throw error;
    }

    //TODO: проверка дали този който се опитва да създаде поста е член на групата


    //TODO: add validation here
    const newEventData = {

        title,
        description,
        city,
        location,
        groupId,
        _ownerId
    }
    const newEvent = Event.create(newEventData);

    return newEvent;

}
