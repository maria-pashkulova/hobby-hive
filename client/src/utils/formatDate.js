//used for event change request cards; no needed in fullcalendar it formats it automatically according to locale prop of FullCalendar
import { format } from 'date-fns';

export const parseUtcDateString = (utcDateString) => {
    // Define the format for the date
    const pattern = "dd.MM.yyyy г.";

    // Format the date using date-fns
    // return format(date, pattern);
    return format(utcDateString, pattern);

}

//Used for event create / update to
//Convert local date to UTC before sending it to the server
//Compulsory to maintain consistency across different regions and time zones.
export const convertLocalToUtc = (localDate) => {

    return new Date(localDate).toISOString();
}

//used for populating event start and end dates in datetime-local field for update details modal
//for create modal addDefaultTimeToSelectedDate is used in GroupEventsCalendar
export const formatDateForDatetimeLocalField = (utcDateString) => {

    // Define the format for the 'datetime-local' input field
    const pattern = "yyyy-MM-dd'T'HH:mm";
    // Format the date using date-fns
    return format(utcDateString, pattern);
}
