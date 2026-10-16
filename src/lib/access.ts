import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function sessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ? { userId: session.user.id } : null;
}
export async function member() { const user=await sessionUser();if(!user)return null;const row=db.prepare("SELECT household_id AS householdId, role FROM membership WHERE user_id=?").get(user.userId) as {householdId:string;role:string}|undefined;return row?{...user,...row}:null; }
export async function owner() { const m = await member(); return m?.role === "owner" ? m : null; }
