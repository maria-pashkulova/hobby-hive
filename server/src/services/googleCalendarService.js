const User = require('../models/User');
const { oauth2Client, calendar } = require('../config/googleApiConfig.js');
const { checkIsFutureEvent } = require('../utils/validateEventData.js');


exports.saveEventInGoogleCalendar = async (userId, { _id, summary, description, location, startDateTime, endDateTime }) => {


    const currUserRefreshToken = await User.findById(userId)
        .select('googleCalendarRefreshToken')
        .lean();

    //Handle by /my-calendar and button -> consent
    if (currUserRefreshToken.googleCalendarRefreshToken === '') {
        const error = new Error('Възможно е да не сте предоставяли достъп до сега или да е изминало много време от последния път, в който сте го направили! От съображения за сигурност се изисква повторното Ви потвърждение за достъп до Вашия Google календар!');
        error.statusCode = 403;
        throw error;
    }

    oauth2Client.setCredentials({
        refresh_token: currUserRefreshToken.googleCalendarRefreshToken
    })

    //Check if user is trying to save past events in his Google calendar
    //Start date time and end date time coming from client are in UTC
    if (!checkIsFutureEvent(startDateTime)) {
        const error = new Error('Събитието вече е започнало или е минало! Не можете да го добавите / обновите в своя Google календар.');
        error.statusCode = 400;
        throw error;
    }

    let eventExists = false;
    try {

        //Authorization for performing the request is optional
        await calendar.events.get({
            calendarId: 'primary',
            eventId: _id
        });
        eventExists = true;

    } catch (error) {
        if (error.code === 404) {
            eventExists = false;
        }
        else {
            throw error;
        }
    }

    //Perfrom authorized request to fetch overlapping events in User's primary google calendar
    //for the particular time and warn him if any
    //Does not include soft deleted events (status: cancelled) (default)
    const eventsResponse = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDateTime, // Start of the time range; utc date string; timeMin is exclusive
        timeMax: endDateTime, // End of the time range; utc date string, timeMax is exclusive
        singleEvents: true, //Expand the recurring event into its individual instances in order to get its exact time and compare it properly in overlapping check
        orderBy: 'startTime', //Ascending order by start time
    });

    let overlappingEvents = eventsResponse.data.items;
    const response = { conflict: false }

    if (eventExists) {
        //If update event is performed, exclude the current event itself
        overlappingEvents = overlappingEvents.filter((event => event.id !== _id));
    }

    // If there's an overlap, return a warning response
    if (overlappingEvents.length > 0) {
        response.conflict = true;
        response.overlappingEvents = overlappingEvents.map((conflictEvent) => ({
            title: conflictEvent.summary,
            color: '#f44336'
        }))
    }

    //Id is not accepted in the request body upon event update so it will be ignored
    const requestBody = {
        id: _id,
        summary: `${summary} (Събитие от Хоби Кошер)`,
        description: description,
        location: location,
        colorId: '5', //Always set Yellow event color
        start: {
            dateTime: startDateTime // utc date string (a time zone offset is required , because it is not explicitly specified -> Z)
        },
        end: {
            dateTime: endDateTime // utc date string (a time zone offset is required , because it is not explicitly specified -> Z)
        }
    }

    if (eventExists) {

        // Update the existing event, if its status was confirmed or cancelled (if it was soft deleted, still in trash bin, it will be restored)
        await calendar.events.update({
            calendarId: 'primary',
            eventId: _id,
            requestBody
        });

    } else {
        //Create a new event in user's Google calendar
        await calendar.events.insert({
            calendarId: 'primary',
            requestBody
        })

    }

    return response;
}