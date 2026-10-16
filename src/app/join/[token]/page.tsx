"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Join() {
  const { token } = useParams<{ token: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(false);

  async function accept() {
    const response = await fetch("/api/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not accept this invitation.");
      return;
    }
    location.href = "/";
  }

  async function createAccount(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-homefind-invite": token },
      body: JSON.stringify({ name: email.split("@")[0], email, password }),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Could not create account.");
      return;
    }
    setRetry(true);
    await accept();
  }

  return <main className="shell auth-shell">
    <header className="top auth-top"><Link className="brand" href="/">HomeFind</Link></header>
    <section className="card auth-card">
      <h1>Join your family</h1>
      <p className="muted">Create an account to share the home inventory, or sign in to accept this invitation.</p>
      <form className="form" onSubmit={createAccount}>
        <div><label htmlFor="join-email">Email</label><input className="field" id="join-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></div>
        <div><label htmlFor="join-password">Password</label><input className="field" id="join-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} /></div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-wide">Create account and join</button>
      </form>
      <p className="footer"><Link href={`/login?returnTo=${encodeURIComponent(`/join/${token}`)}`}>Already have an account? Sign in</Link></p>
      <div className="join-divider"><span>Or</span></div>
      <button className="btn quiet btn-wide" onClick={accept}>{retry ? "Retry accepting invitation" : "Accept invitation"}</button>
    </section>
  </main>;
}
