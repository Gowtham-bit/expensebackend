import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Dummy ID with zero expenses in DB
const token = jwt.sign({ id: '000000000000000000000000' }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

const run = async () => {
    console.log("\nTesting GET /api/transactions/analytics for empty user");
    const analyticsRes = await fetch('http://localhost:5000/api/transactions/analytics', { headers });
    const text = await analyticsRes.text();
    console.log("RESPONSE HTTP CODE:", analyticsRes.status);
    console.log("RESPONSE BODY:", text);
    process.exit(0);
};

run();
