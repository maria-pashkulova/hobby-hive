import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000';


export const getAll = () => request.get(baseUrl);


export const getById = (groupId) => request.get(`${baseUrl}/groups/${groupId}`);
