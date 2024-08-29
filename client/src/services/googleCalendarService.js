import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/users';


export const sendAuthorizationCode = (code) => {
    return request.post(`${baseUrl}/google-calendar/redirect`, { code });
}