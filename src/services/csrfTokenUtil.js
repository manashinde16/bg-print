// csrfTokenUtil.js
import axios from 'axios';
import { API_URL } from 'react-native-dotenv';

export const fetchCsrfToken = async () => {
    try {
        const response = await axios.get(`${API_URL}/payments/get-csrf-token/`, {
            withCredentials: true, // Make sure to send credentials
        });
        const csrfToken = response.headers['x-csrftoken'] || response.data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
};
