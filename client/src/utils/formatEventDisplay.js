import { format } from 'date-fns';

export const formatEventHours = (dateAndTime) => {

    const formattedTime = format(new Date(dateAndTime), 'HH:mm');

    return formattedTime;
}