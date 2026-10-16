"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LocationPicker from "@/components/LocationPicker";

type Location = { id: string; parentId: string | null; name: string };

export default function Detail({ id }: { id: string }) {
  const [item, setItem] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [move, setMove] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch(`/api/items/${id}`, { cache: "no-store" });
    if (!response.ok) {
      setError("Item not found.");
      return;
    }
    const data = await response.json();
    setItem(data);
    setName(data.name);
    setNote(data.note);
    setLocationId(data.locationId);
  }

  useEffect(() => {
    void load();
    fetch("/api/locations", { cache: "no-store" }).then(response => response.ok ? response.json() : []).then(setLocations);
  }, []);

  async function save(body: { name?: string; note?: string; locationId?: string }) {
    setError("");
    const response = await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error);
      return;
    }
    setEdit(false);
    setMove(false);
    await load();
  }

  function locationPath(selected: string) {
    const names: string[] = [];
    let current = locations.find(location => location.id === selected);
    while (current) {
      names.unshift(current.name);
      current = locations.find(location => location.id === current!.parentId);
    }
    return names.join(" › ");
  }

  if (!item) return <main className="shell detail-shell">
    <header className="top"><Link className="brand" href="/">HomeFind</Link><Link className="nav-link" href="/">← All items</Link></header>
    <section className="state-card card" role={error ? "alert" : undefined}><p className={error ? "error" : "muted"}>{error || "Loading item…"}</p></section>
  </main>;

  return <main className="shell detail-shell">
    <header className="top">
      <Link className="brand" href="/">HomeFind</Link>
      <Link className="nav-link" href="/">← All items</Link>
    </header>
    <div className="detail-layout">
      <div className="detail-media"><img className="detailphoto" src={`/api/photos/${id}`} alt={item.name} /></div>
      <section className="detail-panel card" aria-labelledby="item-title">
        <h1 className="title" id="item-title">{item.name}</h1>
        <p className="path detail-location">
          <svg className="path-icon" aria-hidden="true" viewBox="0 0 16 16" fill="none"><path d="M13 6.7c0 3.2-5 7.6-5 7.6S3 9.9 3 6.7a5 5 0 1 1 10 0Z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
          {item.location}
        </p>
        {item.note && <p className="detail-note">{item.note}</p>}
        <div className="actions">
          <button className="btn" onClick={() => { setMove(!move); setEdit(false); }}>Move</button>
          <button className="btn quiet" onClick={() => { setEdit(!edit); setMove(false); }}>Edit</button>
          <button className="btn danger" onClick={async () => {
            if (!confirm(`Delete “${item.name}”? This removes its photo too.`)) return;
            const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
            if (response.ok) location.href = "/";
            else setError("Could not delete. Try again.");
          }}>Delete</button>
        </div>
        {edit && <section className="card detail-edit form" aria-label="Edit item">
          <div><label htmlFor="edit-name">Name</label><input id="edit-name" className="field" value={name} onChange={event => setName(event.target.value)} /></div>
          <div><label htmlFor="edit-note">Note</label><textarea id="edit-note" className="field" value={note} onChange={event => setNote(event.target.value)} /></div>
          <button className="btn" onClick={() => save({ name, note })}>Save changes</button>
        </section>}
        {move && <section className="card detail-edit form" aria-label="Move item">
          <div><span className="label">New location</span><p className="location-summary">{locationPath(locationId) || "Choose a place"}</p><LocationPicker locations={locations} value={locationId} onChange={setLocationId} /></div>
          <button className="btn" onClick={() => save({ locationId })}>Move item</button>
        </section>}
        {error && <p className="error inline-error" role="alert">{error}</p>}
      </section>
    </div>
  </main>;
}
