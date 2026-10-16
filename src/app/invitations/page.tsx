"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Invitations() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function create() {
    setMessage("");
    setIsError(false);
    const response = await fetch("/api/invitations", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error);
      setIsError(true);
      return;
    }
    setUrl(data.url);
  }

  useEffect(() => {
    fetch("/api/invitations", { cache: "no-store" }).then(async response => {
      if (!response.ok) {
        const data = await response.json();
        setMessage(data.error);
        setIsError(true);
        return;
      }
      const invitations = await response.json();
      const active = invitations.filter((invitation: any) => !invitation.usedAt && invitation.expiresAt > Date.now() / 1000).length;
      setMessage(`${active} active ${active === 1 ? "invitation" : "invitations"}`);
    });
  }, []);

  return <main className="shell">
    <header className="top">
      <Link className="brand" href="/">HomeFind</Link>
      <Link className="nav-link" href="/">← All items</Link>
    </header>
    <section className="invite-page">
      <h1>Invite family</h1>
      <p className="muted">Create a private link for one family member. It expires in seven days and works once.</p>
      <button className="btn" onClick={create}>Create invite link</button>
      {url && <div className="invite-link">
        <input className="field" aria-label="Invitation link" readOnly value={url} />
        <button className="btn quiet" onClick={() => navigator.clipboard.writeText(url)}>Copy link</button>
      </div>}
      {message && <p className={`invite-status${isError ? " error" : ""}`} role={isError ? "alert" : "status"}>{message}</p>}
    </section>
  </main>;
}
