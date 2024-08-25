const { isBefore } = require('date-fns');


exports.checkIsFutureEvent = (eventStartDate) => {
    const eventStart = new Date(eventStartDate);
    const todayDate = new Date();

    /*isBefore includes both date and time in comparison
    
    if eventStart date is todays date but event start time
    is before the current time, isBefore returns true -> 
    the event is considered as a past event
    because it has already started (and also it is even possible it has ended)
    */
    return !isBefore(eventStart, todayDate)
}

//TODO: create utility to Validate start and end time for events

//Round lat and lon values returned by Openstreetmap to 5 decimal places
//to ensure consistency, storage efficiency and precision control
exports.normalizeLocationCoordinates = ([lat, lon]) => {
    return [
        Number(lat.toFixed(5)),
        Number(lon.toFixed(5))
    ];
}

exports.validateEventTags = (groupTags, eventTags) => {

    return eventTags.every((tag) => {
        return groupTags.includes(tag);
    });
}


