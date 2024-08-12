import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/groups';


export const createRequest = (groupId, eventId, { description }) => request.post(`${baseUrl}/${groupId}/events/${eventId}/changeRequests`, { description });