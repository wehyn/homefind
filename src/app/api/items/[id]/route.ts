import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import db,{dataDir} from "@/lib/db";
import { member } from "@/lib/access";
export const runtime="nodejs";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}) {
 const m=await member();if(!m)return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;
 const r=db.prepare("SELECT id,name,note,photo,location_id AS locationId FROM item WHERE id=? AND household_id=?").get(id,m.householdId) as any;if(!r)return NextResponse.json({error:"Not found"},{status:404});
 let pathNames:string[]=[];let lid=r.locationId;while(lid){const l=db.prepare("SELECT name,parent_id AS parentId FROM location WHERE id=? AND household_id=?").get(lid,m.householdId) as any;if(!l)break;pathNames.unshift(l.name);lid=l.parentId;}
 return NextResponse.json({...r,location:pathNames.join(" › ")},{headers:{"Cache-Control":"private, no-store"}});
}
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}) {
 const m=await member();if(!m)return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;const body=await req.json();
 const item=db.prepare("SELECT id FROM item WHERE id=? AND household_id=?").get(id,m.householdId);if(!item)return NextResponse.json({error:"Not found"},{status:404});
 if(body.locationId){if(!db.prepare("SELECT id FROM location WHERE id=? AND household_id=?").get(body.locationId,m.householdId))return NextResponse.json({error:"Choose a valid location."},{status:400});db.prepare("UPDATE item SET location_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND household_id=?").run(body.locationId,id,m.householdId);}
 else {const name=String(body.name||"").trim(),note=String(body.note||"").trim();if(!name||name.length>160||note.length>2000)return NextResponse.json({error:"Check the name and note."},{status:400});db.prepare("UPDATE item SET name=?,note=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND household_id=?").run(name,note,id,m.householdId);}
 return NextResponse.json({ok:true});
}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}) {
 const m=await member();if(!m)return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;
 const r=db.prepare("SELECT photo FROM item WHERE id=? AND household_id=?").get(id,m.householdId) as {photo:string}|undefined;if(!r)return NextResponse.json({error:"Not found"},{status:404});
 db.prepare("DELETE FROM item WHERE id=? AND household_id=?").run(id,m.householdId);await fs.rm(path.join(dataDir,"uploads",r.photo),{force:true}).catch(e=>console.error("photo cleanup failed",e));return NextResponse.json({ok:true});
}
