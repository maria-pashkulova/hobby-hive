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