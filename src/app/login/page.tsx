"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return <main className="shell auth-shell">
    <header className="top auth-top"><Link className="brand" href="/">HomeFind</Link></header>
    <section className="card auth-card">
      <h1>Welcome home</h1>
      <p className="muted">Sign in to find your family’s things.</p>
      <form className="form" onSubmit={async event => {
        event.preventDefault();
        setError("");
        const result = await signIn.email({ email, password });
        if (result.error) setError(result.error.message || "Could not sign in.");
        else {
          const next = new URLSearchParams(location.search).get("returnTo");
          try {
            const target = new URL(next || "/", location.origin);
            location.href = target.origin === location.origin ? target.href : "/";
          } catch { location.href = "/"; }
        }
      }}>
        <div><label htmlFor="email">Email</label><input className="field" id="email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></div>
        <div><label htmlFor="password">Password</label><input className="field" id="password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-wide">Sign in</button>
      </form>
      <p className="footer">First account? <Link href="/setup">Set up your home</Link>. After that, ask the owner for a family invitation.</p>
    </section>
  </main>;
}
