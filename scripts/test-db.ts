import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // Verify connection by fetching system item types
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });

  console.log(`Connected! Found ${itemTypes.length} system item types:`);
  for (const type of itemTypes) {
    console.log(`  ${type.color}  ${type.name} (${type.icon})`);
  }

  const userCount = await prisma.user.count();
  console.log(`\nUsers: ${userCount}`);
}

main()
  .catch((e) => {
    console.error("Database connection failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
