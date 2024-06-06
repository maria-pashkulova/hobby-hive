import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/users';

//return promise
export const register = ({ firstName, lastName, email, password }) => (
    request.post(`${baseUrl}/register`, {
        firstName,
        lastName,
        email,
        password
    })
);

//return promise
export const login = ({ email, password }) => (
    request.post(`${baseUrl}/login`, {
        email,
        password
    })
)

//return promise
export const logout = () => request.get(`${baseUrl}/logout`);

export const searchUser = (query) => request.get(`${baseUrl}?search=${query}`);

export const getMyGroups = () => request.get(`${baseUrl}/my-groups`);