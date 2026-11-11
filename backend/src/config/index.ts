import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

const parsedResetMinutes = Number(process.env.DEMO_RESET_INTERVAL_MINUTES);

const resolveDemoMode = (): boolean => {
  if (process.env.DEMO_MODE === "true") return true;
  if (process.env.DEMO_MODE === "false") return false;
  return process.env.NODE_ENV === "production";
};

const parseOriginList = (...rawValues: Array<string | undefined>): string[] => {
  const origins = new Set<string>();
  for (const raw of rawValues) {
    if (!raw) continue;
    for (const entry of raw.split(",")) {
      const cleaned = entry.trim().replace(/\/+$/, "");
      if (cleaned) {
        origins.add(cleaned);
      }
    }
  }
  return Array.from(origins);
};

export default {
  env: process.env.NODE_ENV,
  frontend: process.env.FRONTEND?.trim().replace(/\/+$/, ""),
  corsOrigins: parseOriginList(process.env.FRONTEND, process.env.CORS_ORIGINS),
  allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS === "true",
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  bcrypt_salt: process.env.BCRYPT_SALT,
  jwt_secret: process.env.JWT_SECRET,
  demoMode: resolveDemoMode(),
  demoResetIntervalMinutes:
    Number.isFinite(parsedResetMinutes) && parsedResetMinutes > 0
      ? parsedResetMinutes
      : 30,
  ownerBypassKey: process.env.OWNER_BYPASS_KEY?.trim() || "",
  cronSecret: process.env.CRON_SECRET?.trim() || "",
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || "no-reply@edudrop.org",
  },
};
