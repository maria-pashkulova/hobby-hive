import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000';


export const getAll = async () => request.get(baseUrl);

export const getById = async (groupId) => request.get(`${baseUrl}/groups/${groupId}`);