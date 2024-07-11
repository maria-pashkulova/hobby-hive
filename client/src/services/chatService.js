import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/groups';

export const getGroupChat = (groupId) => request.get(`${baseUrl}/${groupId}/chat`);

export const sendMessage = (groupId, message) => request.post(`${baseUrl}/${groupId}/chat`, message);
