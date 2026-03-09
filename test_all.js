import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const token = jwt.sign({ id: '699c1bd2b786bcf659df4890' }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

const run = async () => {
    try {
        console.log("Testing POST /api/transactions");
        const addRes = await fetch('http://localhost:5000/api/transactions', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Test',
                amount: 100,
                type: 'expense',
                category: 'Food',
                date: new Date().toISOString()
            })
        });
        if (!addRes.ok) throw new Error(await addRes.text());
        const created = await addRes.json();
        console.log("Created successfully with ID", created._id);

        console.log("\nTesting GET /api/transactions");
        const getRes = await fetch('http://localhost:5000/api/transactions', { headers });
        if (!getRes.ok) throw new Error(await getRes.text());
        console.log("GET /api/transactions OK!");

        console.log("\nTesting GET /api/transactions/analytics");
        const analyticsRes = await fetch('http://localhost:5000/api/transactions/analytics', { headers });
        if (!analyticsRes.ok) throw new Error(await analyticsRes.text());
        console.log("GET /api/transactions/analytics OK!");

        console.log("\nTesting PUT /api/transactions/:id");
        const putRes = await fetch(`http://localhost:5000/api/transactions/${created._id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ amount: 150 })
        });
        if (!putRes.ok) throw new Error(await putRes.text());
        console.log("PUT /api/transactions/:id OK!");

        console.log("\nTesting DELETE /api/transactions/:id");
        const delRes = await fetch(`http://localhost:5000/api/transactions/${created._id}`, {
            method: 'DELETE',
            headers
        });
        if (!delRes.ok) throw new Error(await delRes.text());
        console.log("DELETE /api/transactions/:id OK!");

    } catch (err) {
        console.error("ERROR HAPPENED:", err.message);
    }
};

run();
