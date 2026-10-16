"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LocationPicker from "@/components/LocationPicker";
import SignOutButton from "@/components/SignOutButton";

type Item = { id: string; name: string; note: string; location: string };
type Location = { id: string; parentId: string | null; name: string };

export default function Home({ role }: { role: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [hasItems, setHasItems] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [locationId, setLocationId] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  async function load(search = query, signal?: AbortSignal) {
    const response = await fetch(`/api/items?q=${encodeURIComponent(search)}`, { cache: "no-store", signal });
    if (response.ok) {
      const data = await response.json();
      setItems(data.items);
      setHasItems(data.hasItems);
    }
  }

  useEffect(() => {
    fetch("/api/locations", { cache: "no-store" }).then(response => response.ok ? response.json() : []).then(setLocations);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      load(query, controller.signal).catch(reason => {
        if (reason.name !== "AbortError") setError("Could not load items.");
      });
    }, 130);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (saving.current) return;
    setError("");
    if (!photo || !locationId) {
      setError("Choose a photo and location.");
      return;
    }
    saving.current = true;
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("photo", photo);
      formData.set("name", name);
      formData.set("note", note);
      formData.set("locationId", locationId);
      const response = await fetch("/api/items", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not save item.");
        return;
      }
      setOpen(false);
      setName("");
      setNote("");
      setPhoto(null);
      setPreview("");
      setLocationId("");
      setShowNote(false);
      void load().catch(() => setError("Could not load items."));
    } catch {
      setError("Could not save item. Try again.");
    } finally {
      saving.current = false;
      setPending(false);
    }
  }

  async function addLocation(parentId: string | null) {
    const value = window.prompt(parentId ? "Name this place" : "Name this room");
    if (!value?.trim()) return false;
    const response = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value, parentId }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error);
      return false;
    }
    setLocations([...locations, data]);
    setLocationId(data.id);
    return true;
  }

  function pathOf(id: string) {
    const names: string[] = [];
    let current = locations.find(location => location.id === id);
    while (current) {
      names.unshift(current.name);
      current = locations.find(location => location.id === current!.parentId);
    }
    return names.join(" › ");
  }

  function choosePhoto(file?: File) {
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  return <main className="shell">
    <header className="top">
      <Link className="brand" href="/">HomeFind</Link>
      <nav className="links" aria-label="Main navigation">
        <button className="btn" onClick={() => setOpen(true)}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Add item
        </button>
        {role === "owner" && <Link className="nav-link" href="/invitations">Family</Link>}
        <SignOutButton className="nav-link">Sign out</SignOutButton>
      </nav>
    </header>

    <section className="home-search" aria-labelledby="home-title">
      <h1 id="home-title">Find something at home</h1>
      <p className="helper">Search a name and see where it belongs.</p>
      <div className="search-control">
        <svg className="search-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7"/><path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
        <label className="visually-hidden" htmlFor="search">Search item names</label>
        <input id="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search item names" autoComplete="off" />
      </div>
    </section>

    <section className="inventory" aria-labelledby="inventory-title">
      <div className="inventory-head">
        <h2 className="sectionhead" id="inventory-title">{query ? "Search results" : "Recently added"}</h2>
        {items.length > 0 && <span className="item-count">{items.length} {items.length === 1 ? "item" : "items"}</span>}
      </div>
      {items.length ? <div className="item-list">
        {items.map(item => <Link href={`/items/${item.id}`} className="row" key={item.id}>
          <img className="thumb" src={`/api/photos/${item.id}`} alt="" />
          <span className="item-copy">
            <span className="itemname">{item.name}</span>
            <span className="path">
              <svg className="path-icon" aria-hidden="true" viewBox="0 0 16 16" fill="none"><path d="M13 6.7c0 3.2-5 7.6-5 7.6S3 9.9 3 6.7a5 5 0 1 1 10 0Z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
              {item.location}
            </span>
          </span>
          <span className="row-arrow" aria-hidden="true">→</span>
        </Link>)}
      </div> : <div className="empty">
        <p>{query ? "No matching items. Try another name." : hasItems ? "No recent items yet. Add the first one." : "Your home is ready for its first saved item."}</p>
        {!query && <button className="btn quiet" onClick={() => setOpen(true)}>Add your first item</button>}
        {error && <p className="error" role="alert">{error}</p>}
      </div>}
      {error && items.length > 0 && <p className="error inline-error" role="alert">{error}</p>}
    </section>

    <dialog ref={dialogRef} className="add-dialog" aria-labelledby="add-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)}>
      <div className="dialog-head">
        <div><p className="eyebrow">Add to your home</p><h2 id="add-title">Save an item</h2></div>
        <button className="dialog-close" aria-label="Close add item form" onClick={() => setOpen(false)}>×</button>
      </div>
      <form className="form" onSubmit={save}>
        <div>
          <span className="label">Item photo <span className="muted">Required</span></span>
          {preview && <img className="preview" src={preview} alt="Selected item preview" />}
          <div className="photo-buttons">
            <label className="photo-choice"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7.5h3l1.5-2h7l1.5 2h3v11H4v-11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6"/></svg><span>Camera</span><input type="file" accept="image/*" capture="environment" onChange={event => choosePhoto(event.target.files?.[0])} /></label>
            <label className="photo-choice"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/><circle cx="9" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="m5 17 4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg><span>Photo Library</span><input type="file" accept="image/*" onChange={event => choosePhoto(event.target.files?.[0])} /></label>
          </div>
          <small className="muted">JPEG, PNG, WebP, AVIF, or TIFF. Up to 15 MiB.</small>
        </div>
        <div><label htmlFor="name">Item name</label><input id="name" className="field" value={name} onChange={event => setName(event.target.value)} required maxLength={160} /></div>
        <div>
          <span className="label">Location</span>
          <div className="location-summary">{locationId ? pathOf(locationId) : "Choose a place in your home"}</div>
          <LocationPicker locations={locations} value={locationId} onChange={setLocationId} onAdd={addLocation} />
        </div>
        {showNote ? <div><label htmlFor="note">Note <span className="muted">Optional</span></label><textarea id="note" className="field" value={note} maxLength={2000} onChange={event => setNote(event.target.value)} /></div> : <button type="button" className="btnlink add-note" onClick={() => setShowNote(true)}>+ Add a note</button>}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-wide" disabled={pending}>{pending ? "Saving…" : "Save item"}</button>
      </form>
    </dialog>
  </main>;
}
