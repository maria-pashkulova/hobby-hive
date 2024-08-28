import * as request from '../lib/request';
import { convertLocalToUtc } from '../utils/formatDate';
import trimInputValues from '../utils/sanitizeUserInput';

const baseUrl = 'http://localhost:5000/groups';

//Get all events in the currently viewed date range
export const getGroupEvents = (groupId, startDate, endDate) => {

    return request.get(`${baseUrl}/${groupId}/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);

}

//Get event details
export const getById = (groupId, eventId) => request.get(`${baseUrl}/${groupId}/events/${eventId}`);

export const createEvent = (groupId, { title, color, description, specificLocation, start, end, activityTags }) => {

    return request.post(`${baseUrl}/${groupId}/events`,
        trimInputValues(
            {
                title,
                color,
                description,
                specificLocation,
                start: convertLocalToUtc(start),
                end: convertLocalToUtc(end),
                activityTags
            }
        )
    );

}

export const updateEvent = (groupId, eventId, { title, color, description, specificLocation, start, end, activityTags }) => {

    return request.put(`${baseUrl}/${groupId}/events/${eventId}`,
        trimInputValues(
            {
                title,
                color,
                description,
                specificLocation,
                start: convertLocalToUtc(start),
                end: convertLocalToUtc(end),
                activityTags
            }
        )
    );
}

export const deleteEvent = (groupId, eventId) => request.remove(`${baseUrl}/${groupId}/events/${eventId}`);

//Attend an event
export const markAttendance = (groupId, eventId) => request.put(`${baseUrl}/${groupId}/events/${eventId}/markAttendance`);

export const revokeAttendance = (groupId, eventId) => request.put(`${baseUrl}/${groupId}/events/${eventId}/revokeAttendance`);

