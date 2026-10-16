import {redirect} from "next/navigation";import {member} from "@/lib/access";import Detail from "@/components/Detail";
export const dynamic="force-dynamic";
export default async function ItemPage({params}:{params:Promise<{id:string}>}){if(!await member())redirect('/login');const {id}=await params;return <Detail id={id}/>}
