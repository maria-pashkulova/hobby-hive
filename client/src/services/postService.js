import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/groups';

export const getGroupPosts = (groupId) => request.get(`${baseUrl}/${groupId}/posts`);

export const getById = (groupId, postId) => request.get(`${baseUrl}/${groupId}/posts/${postId}`);

export const getUserPostsForGroup = (groupId) => request.get(`${baseUrl}/${groupId}/posts/user-posts`);

export const createPost = (groupId, { text, img }) => request.post(`${baseUrl}/${groupId}/posts`, { text, img });

export const editPost = (groupId, postId, { text, newImg, currImg }) => request.put(`${baseUrl}/${groupId}/posts/${postId}`, { text, newImg, currImg })

export const deletePost = (groupId, postId) => request.remove(`${baseUrl}/${groupId}/posts/${postId}`);