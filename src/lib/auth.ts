import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { createHash } from "node:crypto";
import db, { authDatabase } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(authDatabase, { provider: "sqlite" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  disabledPaths: ["/request-password-reset", "/reset-password"],
  hooks: { before: createAuthMiddleware(async (ctx) => {
    if (ctx.path !== "/sign-up/email") return;
    const invite = ctx.request?.headers.get("x-homefind-invite");
    const setupOpen = !db.prepare("SELECT id FROM user LIMIT 1").get() && !db.prepare("SELECT id FROM home_singleton").get() && !db.prepare("SELECT id FROM household LIMIT 1").get();
    const hash = invite ? createHash("sha256").update(invite).digest("hex") : "";
    const inviteValid = !!invite && !!db.prepare("SELECT id FROM invitation WHERE token_hash=? AND used_at IS NULL AND expires_at>? ").get(hash, Math.floor(Date.now()/1000));
    if (!setupOpen && !inviteValid) throw new APIError("FORBIDDEN", { message: "Create the first home account or use a valid family invitation." });
  }) },
  advanced: { cookiePrefix: "homefind" },
});
