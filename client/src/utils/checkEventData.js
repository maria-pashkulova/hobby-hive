import { isBefore } from "date-fns";
import checkIsObjectEmpty from "./checkIsObjectEmpty";


//Round lat and lon values returned by Openstreetmap to 5 decimal places
//to ensure consistency for comparisons with location data (lat,lon) from DB
//when validating for overlapping events
const normalizeLocationCoordinates = ([lat, lon]) => {
    return [
        Number(lat.toFixed(5)),
        Number(lon.toFixed(5))
    ];
}


//Used upon event create / update
//Upon event create updatedEventId is undefined
//Upon event update updatedEventId is id of the event being edited
//it is needed to exclude current event from existing events because the event being edited will be found as already existing event
//if it has prevously had its location set and its title and start / end times were not changed in a way that passes the check

export const checkForOverlappingEvents = (events, newEventStart, newEventEnd, newEventLocation, newEventTitle, updatedEventId) => {

    //Location field for events is not required so it can be an empty object if no location was selected from
    //Openstreet map results
    //Events in DB always have name, locationRegionCity and coordinates properties with default values if no location
    // was set upon their creation!
    //For new event if no location was selected, there is no conflict and no need to check event time and title
    //Also upon event update it could be the default No location object
    if (checkIsObjectEmpty(newEventLocation) || newEventLocation.name === 'Не е зададена локация за събитието') {
        return false;
    }

    const roundedLocationCoordinates = normalizeLocationCoordinates(newEventLocation.coordinates);

    //not mutating reference values (arrays in this case) is considered a good practice, new reference is created to be modified
    //upon event creation - all events in current visible date range
    //upon event update - all events in current visibl date range except the one being edited at the moment
    let existingEventsDependingOnAction = [...events];
    //Update action
    if (updatedEventId) {
        existingEventsDependingOnAction = existingEventsDependingOnAction.filter((event => event._id !== updatedEventId));
    }

    return existingEventsDependingOnAction.some(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const eventLocation = event.specificLocation; //events locations coordinates are saved in DB rounded to 5 decimal places (if set - otherwise the default specificLocation object's coordinates prop is an empty array)

        let isSameLocation = false;
        //compare only events with set location, skip events with default location from DB
        if (eventLocation.coordinates.length > 0) {
            isSameLocation = eventLocation.coordinates[0] === roundedLocationCoordinates[0]
                && eventLocation.coordinates[1] === roundedLocationCoordinates[1];
        }
        //check time - dates are Date objects and can be compared with >, <
        const isOverlapping = newEventStart < eventEnd && newEventEnd > eventStart;

        //check title - permit same location and time , but different details case (Big location place, different specific spots for that place)
        const isSameTitle = newEventTitle === event.title;

        return isSameLocation && isOverlapping && isSameTitle;
    })
}

export const checkIsFutureEvent = (eventStartDate) => {
    //eventStartDate is utc date string (coming from DB) or Date object (parsed from FullCalendar)
    //which are both valid arguments to isBefore function
    const todayDate = new Date();

    /*isBefore includes both date and time in comparison
    
    if eventStart date is todays date but event start time
    is before the current time, isBefore returns true -> 
    the event is considered as a past event
    because it has already started (and also it is even possible it has ended)
    */
    return !isBefore(eventStartDate, todayDate)
}

