import axios from 'axios';

const API_BASE_URL = 'http://192.168.81.24:3000'; // Schimbă cu URL-ul backend-ului tău

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});