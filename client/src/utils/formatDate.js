//used for event cards; no needed in fullcalendar it formats it automatically according to locale prop of FullCalendar

const formatDateInTimezone = (utcDateString, timeZone) => {
    const date = new Date(utcDateString); // Parse UTC date string-  create a JavaScript Date object from the UTC date string 
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        timeZone,
    };

    return date.toLocaleString('bg-BG', options);

}

export default formatDateInTimezone;