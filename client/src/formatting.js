const eventsResponse = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startDateTime,
    timeMax: endDateTime,
    singleEvents: true,
    orderBy: 'startTime',
});
