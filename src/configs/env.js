import "dotenv/config";
import { z } from "zod";

const required = (name) => z.string().trim().min(1, `${name} is required`);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: required("PORT").pipe(z.coerce.number().int().min(1).max(65535)),
  DATABASE_URL: required("DATABASE_URL"),
  SESSION_SECRET: z.string().trim().min(32, "SESSION_SECRET must be at least 32 characters"),
  SESSION_EXPIRES_IN: required("SESSION_EXPIRES_IN").pipe(z.coerce.number().int().positive()),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const details = result.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  console.error(`invalid environment variables:\n${details}`);
  process.exit(1);
}

export const env = Object.freeze(result.data);
