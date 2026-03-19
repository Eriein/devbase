import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const KEEP_EMAIL = "demo@devstash.io";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { not: KEEP_EMAIL } },
    select: { id: true, email: true },
  });

  if (users.length === 0) {
    console.log("No users to delete (only demo user exists).");
    return;
  }

  console.log(`Deleting ${users.length} user(s):`);
  for (const user of users) {
    console.log(`  - ${user.email} (${user.id})`);
  }

  const userIds = users.map((u) => u.id);

  // Cascade handles most relations, but delete the user row to trigger it
  const result = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });

  console.log(`\nDeleted ${result.count} user(s) and all their content.`);
  console.log(`Kept: ${KEEP_EMAIL}`);
}

main()
  .catch((e) => {
    console.error("Clean-up failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
