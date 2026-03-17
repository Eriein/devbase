import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // ── System item types ──────────────────────────────────────────
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });

  console.log(`System item types (${itemTypes.length}):`);
  for (const type of itemTypes) {
    console.log(`  ${type.color}  ${type.name} (${type.icon})`);
  }

  // ── Demo user ──────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    include: {
      _count: { select: { items: true, collections: true } },
    },
  });

  if (!user) {
    console.log("\n  demo user not found — run npm run db:seed first");
    return;
  }

  console.log(`\nDemo user:`);
  console.log(`  email:         ${user.email}`);
  console.log(`  name:          ${user.name}`);
  console.log(`  isPro:         ${user.isPro}`);
  console.log(`  emailVerified: ${user.emailVerified?.toISOString()}`);
  console.log(`  collections:   ${user._count.collections}`);
  console.log(`  items:         ${user._count.items}`);

  // ── Collections with items ─────────────────────────────────────
  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
  });

  console.log(`\nCollections (${collections.length}):`);
  for (const col of collections) {
    console.log(`\n  📁 ${col.name} — ${col.description}`);
    for (const { item } of col.items) {
      const flag = [item.isFavorite && "★", item.isPinned && "📌"]
        .filter(Boolean)
        .join(" ");
      console.log(
        `     [${item.itemType.name.padEnd(7)}] ${item.title}${flag ? "  " + flag : ""}`
      );
      if (item.url) console.log(`              → ${item.url}`);
    }
  }

  console.log("\nAll checks passed.");
}

main()
  .catch((e) => {
    console.error("Database connection failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
