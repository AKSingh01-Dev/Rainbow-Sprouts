import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Make yourself an admin — replace with your real phone/email, then
  // log in once via OTP so the User row exists before running this,
  // OR just create it here and log in with the same identifier.
  await prisma.user.upsert({
    where: { email: "ankit7779845484@gmail.com" },
    update: { isAdmin: true },
    create: { email: "ankit7779845484@gmail.com", isAdmin: true, name: "Admin" },
  });

  await prisma.product.createMany({
    data: [
      { name: "Sample Product", description: "Replace this with your real product.", price: 49900, stock: 10 },
    ],
  });
}

main().finally(() => prisma.$disconnect());
