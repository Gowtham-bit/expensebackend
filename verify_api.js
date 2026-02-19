
import dotenv from 'dotenv';

// We need to fetch specific user credentials or use a test user
// For simplicity, let's assume a test user exists or we can register one.

const BASE_URL = 'http://localhost:5000/api';

const run = async () => {
    try {
        console.log('Testing API Connectivity...');

        // 1. Test Root Endpoint
        try {
            const res = await fetch('http://localhost:5000/');
            const text = await res.text();
            console.log('Root Endpoint:', text);
        } catch (e) {
            console.log('Root Endpoint Failed:', e.message);
        }

        // 2. Register temporary user
        const randomEmail = `test${Date.now()}@example.com`;
        const password = 'password123';

        console.log(`Registering temporary user: ${randomEmail}`);

        const registerRes = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: randomEmail,
                password: password
            })
        });

        if (!registerRes.ok) {
            const err = await registerRes.text();
            console.error('Registration Failed:', registerRes.status, err);
            return;
        }

        const registerData = await registerRes.json();
        const token = registerData.token;
        console.log('Got Token:', token ? 'Yes' : 'No');

        if (!token) {
            console.error('Failed to get token');
            return;
        }

        // 3. Test Analytics Endpoint
        console.log('Testing Analytics Endpoint...');
        const analyticsRes = await fetch(`${BASE_URL}/transactions/analytics`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!analyticsRes.ok) {
            const err = await analyticsRes.text();
            console.error('Analytics Failed:', analyticsRes.status, err);
            return;
        }

        const analyticsData = await analyticsRes.json();
        console.log('Analytics Response Status:', analyticsRes.status);
        console.log('Analytics Data Keys:', Object.keys(analyticsData));

        // 4. Cleanup (optional, maybe delete user?)

    } catch (error) {
        console.error('Error:', error);
    }
};

run();
