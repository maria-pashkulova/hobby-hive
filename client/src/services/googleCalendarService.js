import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/google/google-calendar';


export const sendAuthorizationCode = (code) => {
    return request.post(`${baseUrl}/oauth2callback`, { code });
}

export const addToCalendar = (event) => {
    return request.post(baseUrl, {
        _id: event._id,
        summary: event.title,
        description: event.description,
        location: event.specificLocation.name,
        startDateTime: event.start,
        endDateTime: event.end
    })
}