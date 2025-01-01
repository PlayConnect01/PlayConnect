import { ENV } from './env';

export const BASE_URL = ENV.API_URL;

// You can add other API related configurations here
export const API_TIMEOUT = 30000; // 30 seconds
export const API_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};
