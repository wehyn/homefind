import Link from "next/link";
import SetupForm from "@/components/SetupForm";
import { sessionUser } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function Setup() {
  const signedIn = Boolean(await sessionUser());
  return <main className="shell auth-shell">
    <header className="top auth-top"><Link className="brand" href="/">HomeFind</Link></header>
    <section className="card auth-card">
      <h1>Set up your home</h1>
      <SetupForm signedIn={signedIn} />
    </section>
  </main>;
}
