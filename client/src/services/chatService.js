import * as request from '../lib/request';
import trimInputValues from '../utils/sanitizeUserInput'; //Sanitize user input before making a request


const baseUrl = 'http://localhost:5000/groups';

export const getGroupChat = (groupId) => request.get(`${baseUrl}/${groupId}/chat`);

export const sendMessage = (groupId, message) => request.post(`${baseUrl}/${groupId}/chat`, trimInputValues(message));
