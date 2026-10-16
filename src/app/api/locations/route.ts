import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import db from "@/lib/db";
import { member } from "@/lib/access";
export const runtime = "nodejs";
export async function GET() {
  const m = await member(); if (!m) return NextResponse.json({error:"Unauthorized"},{status:401});
  return NextResponse.json(db.prepare("SELECT id,parent_id AS parentId,name FROM location WHERE household_id=? ORDER BY name COLLATE NOCASE").all(m.householdId), {headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(req: Request) {
  const m = await member(); if (!m) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {name,parentId=null} = await req.json(); const clean=String(name||"").trim();
  if (!clean || clean.length>80) return NextResponse.json({error:"Enter a location name up to 80 characters."},{status:400});
  if (parentId && !db.prepare("SELECT id FROM location WHERE id=? AND household_id=?").get(parentId,m.householdId)) return NextResponse.json({error:"Location not found."},{status:404});
  const id=randomUUID(); db.prepare("INSERT INTO location(id,household_id,parent_id,name) VALUES(?,?,?,?)").run(id,m.householdId,parentId,clean);
  return NextResponse.json({id,parentId,name:clean});
}
