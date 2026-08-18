import { drizzle } from "drizzle-orm/node-postgres";
import { validateEnv } from "../config/env";

const env = validateEnv();

export const db = drizzle(env?.DATABASE_URL ?? "");
