import Link from "next/link";
import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/access";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function NoHome() {
  if (!await sessionUser()) redirect("/login");
  return <main className="shell auth-shell">
    <header className="top auth-top"><Link className="brand" href="/">HomeFind</Link></header>
    <section className="state-card card">
      <h1>No home linked</h1>
      <p className="muted">This account is not a member of a household. Ask the owner for a fresh invitation link, or set up the home with its server setup token.</p>
      <div className="actions">
        <Link className="btn" href="/setup">Set up this server</Link>
        <SignOutButton className="btn quiet">Sign out and return</SignOutButton>
      </div>
    </section>
  </main>;
}
