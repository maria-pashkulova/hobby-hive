import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/groups';

export const getGroupEventChangeRequests = (groupId) => request.get(`${baseUrl}/${groupId}/groupEventChangeRequests`);


export const createRequest = (groupId, eventId, { description }) => request.post(`${baseUrl}/${groupId}/groupEventChangeRequests`, { requestedEventId: eventId, description });