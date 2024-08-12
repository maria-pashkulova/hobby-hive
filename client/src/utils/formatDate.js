//used for event cards; no needed in fullcalendar it formats it automatically according to locale prop of FullCalendar
import { format } from 'date-fns';

const formatDate = (utcDateString) => {
    const date = new Date(utcDateString); // Parse UTC date string - create a JavaScript Date object from the UTC date string 

    // Define the format for the date
    const pattern = "dd.MM.yyyy";

    // Format the date using date-fns
    return format(date, pattern);

}

export default formatDate;