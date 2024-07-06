import * as request from '../lib/request';
import trimInputValues from '../utils/sanitizeUserInput'; //Sanitize user input before making a request

const baseUrl = 'http://localhost:5000/users';

//Returns a promise
export const register = ({ firstName, lastName, email, password }) => (

    request.post(`${baseUrl}/register`, trimInputValues({
        firstName,
        lastName,
        email,
        password
    }))
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

export const getMyGroups = (pagination = {}) => {

    // Converts the pagination object to a query string
    const params = new URLSearchParams(pagination).toString();

    return request.get(`${baseUrl}/my-groups?${params}`);
}

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