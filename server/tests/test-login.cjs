const axios = require('axios');

const API_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'aadhaar-test@example.com',
  password: 'TestPassword123!',
};

(async () => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, TEST_USER, { withCredentials: true });
    const cookie = res.headers['set-cookie']?.[0];
    if (!cookie) throw new Error('No auth cookie set on login');
    const token = cookie.split(';')[0].split('=')[1];
    console.log('JWT Token:', token);
  } catch (err) {
    // Print full error details
    if (err.response) {
      console.error('Login failed:', err.response.status, err.response.data);
    } else if (err.message) {
      console.error('Login failed:', err.message);
    } else {
      console.error('Login failed:', err);
    }
  }
})(); 