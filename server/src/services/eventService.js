const Event = require('../models/Event');



exports.getAllGroupEvents = (groupId) => {
    // const events = Event.find({
    //     start: { $gte: start.toDate() },
    //     end: { $lte: end.toDate() }
    // })

    const events = Event.find({ groupId });

    return events;
}

//city, location, status
exports.create = (title, description, city, location, status) => {

    //TODO: add validation here
    const newEventData = {

        title,
        description,
        city,
        location,
        status
    }
    const newEvent = Event.create(newEventData);

    return newEvent;

}
