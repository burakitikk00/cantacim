
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    const adminEmail = 'admin@linabutik.com';
    const newPassword = 'Admin123!@#';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    try {
        const res = await pool.query('SELECT * FROM "User" WHERE email = $1', [adminEmail]);

        if (res.rows.length === 0) {
            console.log(`User with email ${adminEmail} not found.`);
            return;
        }

        const userId = res.rows[0].id;
        await pool.query(
            'UPDATE "User" SET "hashedPassword" = $1, "isActive" = true, "failedAttempts" = 0, "lockedUntil" = NULL WHERE id = $2',
            [hashedPassword, userId]
        );

        console.log(`Password for ${adminEmail} (ID: ${userId}) has been reset to: ${newPassword}`);
    } catch (error) {
        console.error('Error during reset:', error);
    } finally {
        await pool.end();
    }
}

main();
