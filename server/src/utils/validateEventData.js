const { isBefore } = require('date-fns');


exports.checkIsFutureEvent = (eventStartDate) => {
    //eventStartDate is comes as utc date string which is valid argument for isBefore
    //in all cases when checkIsFutureEvent is called
    const todayDate = new Date();

    /*isBefore includes both date and time in comparison
    
    if eventStart date is todays date but event start time
    is before the current time, isBefore returns true -> 
    the event is considered as a past event
    because it has already started (and also it is even possible it has ended)
    */
    return !isBefore(eventStartDate, todayDate)
}

exports.checkIsEventEditable = (eventStartDate) => {
    //eventStartDate is comes as utc date string when called upon event update
    // Get the current time
    const now = new Date();

    // Add 2 hours to the current time (added in ms)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Return true if the date is at least two hours from now, false otherwise
    return new Date(eventStartDate).getTime() >= twoHoursFromNow;
}

//TODO: create utility to Validate start and end time for events -> use yup validation schema instead

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


