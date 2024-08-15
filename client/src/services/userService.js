import * as request from '../lib/request';
import trimInputValues from '../utils/sanitizeUserInput'; //Sanitize user input before making a request

const baseUrl = 'http://localhost:5000/users';


//Returns a promise
export const login = (userData) => (
    request.post(`${baseUrl}/login`, userData)
);

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
export const logout = () => request.get(`${baseUrl}/logout`);

export const searchUser = (query) => request.get(`${baseUrl}?search=${query}`);

export const getMyGroups = (pagination = {}) => {

    // Converts the pagination object to a query string
    const params = new URLSearchParams(pagination).toString();

    return request.get(`${baseUrl}/my-groups?${params}`);
}

export const getMyDetails = () => request.get(`${baseUrl}/my-details`);


export const updateUser = (userId, { firstName, lastName, email, password, newProfilePic, currProfilePic }) => {

    const sanitizedInput = trimInputValues({ firstName, lastName, email, password });

    return request.put(`${baseUrl}/${userId}`, {
        ...sanitizedInput,
        newProfilePic,
        currProfilePic
    })

};

//Get My events in the currently viewed date range
export const getMyEvents = (startDate, endDate) => {
    return request.get(`${baseUrl}/my-calendar?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
}