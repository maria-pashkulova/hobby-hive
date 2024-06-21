import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/users';

//return promise
//repeatPass is also sent!
export const register = ({ firstName, lastName, email, password }) => (
    //TODO check if password and repeat password match - maybe here at service

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
);

//return promise
export const logout = () => request.get(`${baseUrl}/logout`);

export const searchUser = (query) => request.get(`${baseUrl}?search=${query}`);

export const getMyGroups = () => request.get(`${baseUrl}/my-groups`);

export const getMyDetails = () => request.get(`${baseUrl}/my-details`);

//return promise
//repeatPass is also sent!
export const updateUser = (userId, { firstName, lastName, email, password, newProfilePic, currProfilePic }) => (

    //TODO check if password and repeat password match - maybe here at service
    request.put(`${baseUrl}/${userId}`, {
        firstName,
        lastName,
        email,
        password,
        newProfilePic,
        currProfilePic
    })

);