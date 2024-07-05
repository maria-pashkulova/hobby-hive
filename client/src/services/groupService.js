import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/groups';


export const getAll = (filterAndPagination = {}) => {
    // Converts the filterAndPagination object to a query string
    const params = new URLSearchParams(filterAndPagination).toString();

    return request.get(`${baseUrl}?${params}`);
}


export const getById = (groupId) => request.get(`${baseUrl}/${groupId}`);

export const createGroup = ({ name, category, location, description, imageUrl, members, activityTags }) => request.post(baseUrl, { name, category, location, description, imageUrl, members, activityTags });

export const updateGroupDetails = (groupId, { name, category, location, description, newImg, currImg }) => request.patch(`${baseUrl}/${groupId}`, { name, category, location, description, newImg, currImg });

export const addMember = (groupId, _id) => request.patch(`${baseUrl}/${groupId}/addMember`, { _id });

export const removeMember = (groupId, _id) => request.patch(`${baseUrl}/${groupId}/removeMember`, { _id });
