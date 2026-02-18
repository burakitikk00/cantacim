const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const attributes = await prisma.attribute.findMany({
        include: { values: true }
    });
    console.log('Attributes:', JSON.stringify(attributes, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
