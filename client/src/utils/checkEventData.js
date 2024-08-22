import { isBefore, isSameDay } from "date-fns";
import checkIsObjectEmpty from "./checkIsObjectEmpty";

export const checkForOverlappingEvents = (events, newEventStart, newEventEnd, newEventLocation, newEventTitle) => {
    return events.some(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const eventLocation = event.specificLocation;

        //check location; 
        //Location field in CreateEvent modal is not required so it can be an empty object! (check newEventLocation)
        //Events in DB always have name and coordinates properties even if no location was set!
        let isSameLocation = false;
        if (!checkIsObjectEmpty(newEventLocation)) {
            isSameLocation = eventLocation.coordinates[0] === newEventLocation.coordinates[0]
                && eventLocation.coordinates[1] === newEventLocation.coordinates[1];
        }
        //check time
        const isOverlapping = newEventStart < eventEnd && newEventEnd > eventStart;

        //check title - permit same location and time , but different details case (Big location place, different specific spots for that place)
        const isSameTitle = newEventTitle === event.title;

        return isSameLocation && isOverlapping && isSameTitle;
    })
}

export const checkIsFutureEvent = (eventStartDate) => {
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