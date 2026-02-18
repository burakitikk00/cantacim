
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'burakitikk@gmail.com';
    const newPassword = 'Admin123!@#';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    try {
        const user = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!user) {
            console.log(`User with email ${adminEmail} not found.`);
            const users = await prisma.user.findMany({
                select: { email: true, role: true }
            });
            console.log('Available users:', users);
            return;
        }

        await prisma.user.update({
            where: { email: adminEmail },
            data: {
                hashedPassword: hashedPassword,
                isActive: true,
                failedAttempts: 0,
                lockedUntil: null
            }
        });

        console.log(`Password for ${adminEmail} has been reset to: ${newPassword}`);
    } catch (error) {
        console.error('Error during reset:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
