const axios = require('axios');

const API_URL = 'http://localhost:5000';
const TOKEN = 'PASTE_YOUR_TOKEN_HERE'; // Paste the token from the previous step

(async () => {
  try {
    const res = await axios.get(`${API_URL}/api/schemes`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('Schemes:', res.data);
  } catch (err) {
    console.error('Fetch failed:', err.response?.data || err.message);
  }
})(); 