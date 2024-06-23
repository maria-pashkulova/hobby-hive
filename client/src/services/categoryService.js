import * as request from '../lib/request';

const baseUrl = 'http://localhost:5000/categories';

export const getCategories = () => request.get(baseUrl);