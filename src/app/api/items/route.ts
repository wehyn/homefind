import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import db, { dataDir } from "@/lib/db";
import { member } from "@/lib/access";
export const runtime = "nodejs";
function paths(householdId:string) {
 const rows=db.prepare(`SELECT i.id,i.name,i.note,i.photo,i.created_at AS createdAt,l.id AS locationId FROM item i JOIN location l ON l.id=i.location_id AND l.household_id=i.household_id WHERE i.household_id=? ORDER BY i.created_at DESC`).all(householdId) as Array<any>;
 return rows.map(r=>{const chain:string[]=[];let id=r.locationId;while(id){const loc=db.prepare("SELECT name,parent_id AS parentId FROM location WHERE id=? AND household_id=?").get(id,householdId) as any;if(!loc)break;chain.unshift(loc.name);id=loc.parentId;}return {...r,location:chain.join(" › ")};});
}
export async function GET(req:Request) {
 const m=await member();if(!m)return NextResponse.json({error:"Unauthorized"},{status:401});
 const q=new URL(req.url).searchParams.get("q")?.trim()||"";const all=paths(m.householdId);
 const filtered=q?all.filter(i=>i.name.toLocaleLowerCase().includes(q.toLocaleLowerCase())):all.slice(0,6);
 return NextResponse.json({items:filtered,hasItems:all.length>0},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(req:Request) {
 const m=await member();if(!m)return NextResponse.json({error:"Unauthorized"},{status:401});
 const form=await req.formData();const name=String(form.get("name")||"").trim(),note=String(form.get("note")||"").trim(),locationId=String(form.get("locationId")||""), file=form.get("photo");
 if(!name||name.length>160||note.length>2000||!locationId||!(file instanceof File))return NextResponse.json({error:"Check the name, note, photo, and location."},{status:400});
 if(file.size>15*1024*1024)return NextResponse.json({error:"Photo must be 15 MiB or smaller."},{status:413});
 if(!db.prepare("SELECT id FROM location WHERE id=? AND household_id=?").get(locationId,m.householdId))return NextResponse.json({error:"Choose a valid location."},{status:400});
 let bytes:Buffer;try{bytes=Buffer.from(await file.arrayBuffer());const meta=await sharp(bytes,{limitInputPixels:40000000}).metadata();if(!["jpeg","png","webp","avif","tiff"].includes(meta.format||""))throw new Error("unsupported");}catch{return NextResponse.json({error:"Use a supported JPEG, PNG, WebP, AVIF, or TIFF photo."},{status:415});}
 const id=randomUUID(), filename=`${randomUUID()}.webp`, dest=path.join(dataDir,"uploads",filename);
 try {await sharp(bytes,{limitInputPixels:40000000}).rotate().resize({width:2400,height:2400,fit:"inside",withoutEnlargement:true}).webp({quality:84}).toFile(dest);
  db.prepare("INSERT INTO item(id,household_id,location_id,name,note,photo,created_by) VALUES(?,?,?,?,?,?,?)").run(id,m.householdId,locationId,name,note,filename,m.userId);
  return NextResponse.json({id});
 } catch(e) {await fs.rm(dest,{force:true});console.error("item save failed",e);return NextResponse.json({error:"Could not save the item. Please try again."},{status:500});}
}
