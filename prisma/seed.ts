import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function upsertUser(name: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { name, email, passwordHash },
  });
  console.log(`Usuário pronto: ${email}`);
}

async function main() {
  await upsertUser(
    process.env.SEED_OWNER_NAME ?? "Dono",
    process.env.SEED_OWNER_EMAIL ?? "dono@oficina.local",
    process.env.SEED_OWNER_PASSWORD ?? "mudar123"
  );
  await upsertUser(
    process.env.SEED_WIFE_NAME ?? "Esposa",
    process.env.SEED_WIFE_EMAIL ?? "esposa@oficina.local",
    process.env.SEED_WIFE_PASSWORD ?? "mudar123"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
