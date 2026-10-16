import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import db,{dataDir} from "@/lib/db";
import {member} from "@/lib/access";
export const runtime="nodejs";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}) {
 const m=await member();if(!m)return new NextResponse("Unauthorized",{status:401});const {id}=await params;const r=db.prepare("SELECT photo FROM item WHERE id=? AND household_id=?").get(id,m.householdId) as {photo:string}|undefined;if(!r)return new NextResponse("Not found",{status:404});
 try{return new NextResponse(await fs.readFile(path.join(dataDir,"uploads",r.photo)),{headers:{"Content-Type":"image/webp","Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"}});}catch{return new NextResponse("Not found",{status:404});}
}
