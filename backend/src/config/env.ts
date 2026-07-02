import * as dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is missing.`);
  }

  return value;
}

export const env = {
  databaseUrl: requireEnv("DATABASE_URL"),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
  jwtSecret: requireEnv("JWT_SECRET"),
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
};
