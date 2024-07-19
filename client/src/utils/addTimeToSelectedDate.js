import { format } from "date-fns";

// Function to format the selected date to the required format from input of type datetime-local
const addDefaultTimeToSelectedDate = (date) => {
    if (!date) return '';
    const selectedDate = new Date(date);
    selectedDate.setHours(8, 0, 0, 0);
    const datetimeLocalFormat = format(selectedDate, "yyyy-MM-dd'T'HH:mm");
    return datetimeLocalFormat;
};

export default addDefaultTimeToSelectedDate;