const axios = require('axios');

const API_URL = 'http://localhost:5000';
const TOKEN = 'PASTE_YOUR_TOKEN_HERE'; // Paste the token from the login script

(async () => {
  try {
    const res = await axios.get(`${API_URL}/api/schemes/active`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('Active Schemes:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Fetch failed:', err.response.status, err.response.data);
    } else {
      console.error('Fetch failed:', err.message);
    }
  }
})(); 