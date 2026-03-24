import { db } from './src/lib/db';

async function main() {
  try {
    const product = await db.product.findUnique({
        where: { slug: "guess-abey-el-ve-omuz-cantasi-43759639" },
        include: {
            category: true,
            variants: {
                where: { isActive: true },
                include: {
                    attributes: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: {
                                        select: {
                                            id: true,
                                            name: true,
                                            slug: true,
                                            sortOrder: true,
                                            hasColor: true,
                                            createdAt: true,
                                            updatedAt: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            reviews: {
                where: { isApproved: true },
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    user: { select: { name: true } }
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });
    console.log("Product:", product ? "FOUND" : "NOT FOUND");
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    await db.$disconnect();
  }
}

main();
