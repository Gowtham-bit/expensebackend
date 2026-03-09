import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const token = jwt.sign({ id: '699c1bd2b786bcf659df4890' }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

fetch('http://localhost:5000/api/transactions/analytics', {
    headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.json()).then(data => {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
