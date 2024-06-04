import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/groups';


export const getAll = () => request.get(baseUrl);


export const getById = (groupId) => request.get(`${baseUrl}/${groupId}`);

export const createGroup = ({ name, category, location, description, imageUrl }) => request.post(baseUrl, { name, category, location, description, imageUrl });
