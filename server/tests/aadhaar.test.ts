// @jest-environment node
// Jest test file for Aadhaar API integration
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_USER = {
  name: 'Test User',
  email: 'aadhaar-test@example.com',
  password: 'TestPassword123!',
  serviceNumber: 'TEST123456',
};

describe('Aadhaar API Integration', () => {
  let token: string;

  beforeAll(async () => {
    // Register or login the test user
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, TEST_USER, { withCredentials: true });
      token = res.data.token || res.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1];
    } catch (err: any) {
      // If already registered, try login
      if (err.response && err.response.status === 400 && err.response.data.message && err.response.data.message.includes('already registered')) {
        // Try login endpoint
        const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
          email: TEST_USER.email,
          password: TEST_USER.password,
        }, { withCredentials: true });
        // The login endpoint returns user data, not the token, so get the token from the cookie
        const cookie = loginRes.headers['set-cookie']?.[0];
        if (!cookie) throw new Error('No auth cookie set on login');
        token = cookie.split(';')[0].split('=')[1];
      } else {
        throw new Error('Failed to register or login test user: ' + (err.message || err));
      }
    }
  });

  it('should initiate Aadhaar verification (OTP)', async () => {
    const aadhaarNumber = '123412341234'; // Use a dummy or test Aadhaar number
    const res = await axios.post(
      `${API_URL}/api/aadhaar/initiate`,
      { aadhaarNumber, verificationType: 'OTP' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(res.data).toHaveProperty('txnId');
    expect(res.data.success).toBe(true);
  });
}); 