import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function check() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        const adminDb = conn.connection.db.admin();
        const dbs = await adminDb.listDatabases();

        let out = "Databases:\n";
        for (let db of dbs.databases) {
            out += `- ${db.name}\n`;
        }

        const dbName = conn.connection.db.databaseName;
        out += `\nCollections in current db (${dbName}):\n`;
        const cols = await conn.connection.db.listCollections().toArray();
        for (let c of cols) {
            out += `- ${c.name}\n`;
        }

        fs.writeFileSync("db_info.txt", out);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync("db_info.txt", String(err));
        process.exit(1);
    }
}
check();
