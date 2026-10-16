"use client";

import { useState } from "react";

export default function SetupForm({ signedIn }: { signedIn: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          headers: { "Content-Type": "application/json" },
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
        body: JSON.stringify({ name }),
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
    <p className="muted">{signedIn ? "This account is ready to finish the first home setup." : accountCreated ? "Account created. Finish setup to make this the home owner." : "Create the first account. It will become the owner of this home."}</p>
    <form className="form" onSubmit={submit}>
      {!accountCreated && <>
        <div><label htmlFor="setup-email">Email</label><input className="field" id="setup-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></div>
        <div><label htmlFor="setup-password">Password</label><input className="field" id="setup-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} /></div>
      </>}
      <div><label htmlFor="home-name">Home name</label><input className="field" id="home-name" value={name} onChange={event => setName(event.target.value)} /></div>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-wide">{accountCreated ? "Finish home setup" : "Create home"}</button>
    </form>
  </>;
}
