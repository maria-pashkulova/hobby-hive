import * as request from '../lib/request';
import trimInputValues from '../utils/sanitizeUserInput';
const baseUrl = 'http://localhost:5000/groups';

export const getGroupEventChangeRequests = (groupId, pagination = {}) => {

    // Converts the pagination object to a query string
    const params = new URLSearchParams(pagination).toString();

    return request.get(`${baseUrl}/${groupId}/groupEventChangeRequests?${params}`);

}


export const createRequest = (groupId, eventId, formValues) => request.post(`${baseUrl}/${groupId}/groupEventChangeRequests`, { requestedEventId: eventId, ...trimInputValues(formValues) });

export const deleteRequest = (groupId, requestId) => request.remove(`${baseUrl}/${groupId}/groupEventChangeRequests/${requestId}`); 