//used for event change request cards; no needed in fullcalendar it formats it automatically according to locale prop of FullCalendar
import { format } from 'date-fns';

export const parseUtcDateString = (utcDateString) => {
    const date = new Date(utcDateString); // Parse UTC date string - create a JavaScript Date object from the UTC date string 

    // Define the format for the date
    const pattern = "dd.MM.yyyy";

    // Format the date using date-fns
    return format(date, pattern);

}

//Used for event create / update to
// convert local date to UTC before sending it to the server
export const convertLocalToUtc = (localDate) => {

    return new Date(localDate).toISOString();
}

//used for populating event start and end dates in datetime-local field update details modal
export const formatDateForDatetimeLocalField = (utcDateString) => {
    const date = new Date(utcDateString); // Parse UTC date string - create a JavaScript Date object from the UTC date string 

    // Define the format for the 'datetime-local' input field
    const pattern = "yyyy-MM-dd'T'HH:mm";
    // Format the date using date-fns
    return format(date, pattern);
}
