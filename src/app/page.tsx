import {redirect} from "next/navigation";import {member,sessionUser} from "@/lib/access";import Home from "@/components/Home";
export const dynamic="force-dynamic";
export default async function Page(){const user=await sessionUser();if(!user)redirect("/login");const m=await member();if(!m)redirect("/no-home");return <Home role={m.role}/>}
