import { format, isSameDay } from 'date-fns';
import { bg } from 'date-fns/locale'; // Import the Bulgarian locales


//for single day events extract only time
const formatSingleDayEventTime = (dateAndTime) => format(dateAndTime, 'HH:mm ч.');


//for single day events extract date and time
const formatMultiDayEventTime = (dateAndTime) => format(dateAndTime, 'dd MMM, HH:mm ч.', { locale: bg });


//start and end come from FullCalendar as Javascript Date objects which is expected from format() function in date-fns
//as first argument!

export const formatEventTime = (start, end) => {
    let formattedStartTime;
    let formattedEndTime;

    if (isSameDay(start, end)) {
        formattedStartTime = formatSingleDayEventTime(start);
        formattedEndTime = formatSingleDayEventTime(end);
    } else {
        formattedStartTime = formatMultiDayEventTime(start);
        formattedEndTime = formatMultiDayEventTime(end);
    }

    return `${formattedStartTime} - ${formattedEndTime}`;
}