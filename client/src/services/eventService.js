import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/groups';

export const getGroupEvents = (groupId) => request.get(`${baseUrl}/${groupId}/events`);

export const createEvent = (groupId, { name, description, specificLocation, time, activityTags }) => {
    // Convert local date to UTC
    const dateTimeUTC = new Date(time).toISOString();
    return request.post(`${baseUrl}/${groupId}/events`, { name, description, specificLocation, time: dateTimeUTC, activityTags });

}