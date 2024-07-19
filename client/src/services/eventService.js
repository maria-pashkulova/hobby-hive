import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/groups';

export const getGroupEvents = (groupId) => request.get(`${baseUrl}/${groupId}/events`);

export const createEvent = (groupId, { title, description, specificLocation, start, end, activityTags }) => {

    // Convert local date to UTC before sending it to the server
    const startDateTimeUTC = new Date(start).toISOString();
    const endDateTimeUTC = new Date(end).toISOString();

    return request.post(`${baseUrl}/${groupId}/events`, { title, description, specificLocation, start: startDateTimeUTC, end: endDateTimeUTC, activityTags });

}