import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/configs/db.js";
import { registerSchema } from "../src/modules/auth/auth.validation.js";

const BCRYPT_ROUNDS = 12;

async function main() {
  const env = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    first_name: process.env.ADMIN_FIRST_NAME,
    last_name: process.env.ADMIN_LAST_NAME,
  };

  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => `ADMIN_${key.toUpperCase()}`);

  if (missing.length > 0) {
    throw new Error(`missing environment variables: ${missing.join(", ")}`);
  }

  const parsed = registerSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`invalid admin data: ${details}`);
  }

  const { email, password, first_name, last_name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`admin already exists: ${existing.email} (id: ${existing.id})`);
    return;
  }

  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const admin = await prisma.user.create({
    data: { email, password_hash, first_name, last_name, role: "ADMIN" },
    select: {
      id: true,
      email: true,
      role: true,
      first_name: true,
      last_name: true,
      created_at: true,
    },
  });

  console.log("admin created:", admin);
}

main()
  .catch((error) => {
    console.error(`create-admin failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
