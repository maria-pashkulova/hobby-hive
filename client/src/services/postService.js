import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/groups';

export const getGroupPosts = (groupId) => request.get(`${baseUrl}/${groupId}/posts`);