import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/locations';

export const getLocations = () => request.get(baseUrl);