"use client";

import { useState } from "react";

export default function SetupForm({ signedIn }: { signedIn: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [name, setName] = useState("Our home");
  const [error, setError] = useState("");
  const [accountCreated, setAccountCreated] = useState(signedIn);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    let accountReady = accountCreated;
    try {
      if (!accountReady) {
        const response = await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-homefind-setup": token },
          body: JSON.stringify({ name: email.split("@")[0], email, password }),
        });
        if (!response.ok) {
          const data = await response.json();
          setError(data.message || "Could not create account.");
          return;
        }
        setAccountCreated(true);
        accountReady = true;
      }
      const result = await fetch("/api/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name }),
      });
      const data = await result.json();
      if (!result.ok) {
        setError(data.error || "Could not finish setup.");
        return;
      }
      location.href = "/";
    } catch {
      setError(accountReady ? "Could not finish setup. Try again." : "Could not create account. Try again.");
    }
  }

  return <>
    <p className="muted">{signedIn ? "This account is signed in and ready to finish setup. Enter the one-time setup token from your server." : accountCreated ? "Account created. Enter the one-time setup token from your server to finish setup." : "Create the owner account. You’ll need the one-time setup token from your server."}</p>
    <form className="form" onSubmit={submit}>
      {!accountCreated && <>
        <div><label htmlFor="setup-email">Email</label><input className="field" id="setup-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></div>
        <div><label htmlFor="setup-password">Password</label><input className="field" id="setup-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} /></div>
      </>}
      <div><label htmlFor="home-name">Home name</label><input className="field" id="home-name" value={name} onChange={event => setName(event.target.value)} /></div>
      <div><label htmlFor="setup-token">One-time setup token</label><input className="field" id="setup-token" type="password" autoComplete="off" required value={token} onChange={event => setToken(event.target.value)} /></div>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-wide">{accountCreated ? "Finish home setup" : "Create home"}</button>
    </form>
  </>;
}
