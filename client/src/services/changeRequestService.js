import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/groups';

export const getGroupEventChangeRequests = (groupId, pagination = {}) => {

    // Converts the pagination object to a query string
    const params = new URLSearchParams(pagination).toString();

    return request.get(`${baseUrl}/${groupId}/groupEventChangeRequests?${params}`);

}


export const createRequest = (groupId, eventId, { description }) => request.post(`${baseUrl}/${groupId}/groupEventChangeRequests`, { requestedEventId: eventId, description });