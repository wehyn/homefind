"use client";
import { useState } from "react";

type Location = { id: string; parentId: string | null; name: string };
type TreeProps = { locations: Location[]; value: string; expanded: string[]; onChange: (id: string) => void; onToggle: (id: string) => void; parentId?: string | null; depth?: number };
function Tree({ locations, value, expanded, onChange, onToggle, parentId = null, depth = 0 }: TreeProps) {
  const children = locations.filter(location => location.parentId === parentId);
  return <div className={depth ? "children" : "tree"}>{children.map(location => {
    const open = expanded.includes(location.id);
    const hasChildren = locations.some(child => child.parentId === location.id);
    return <div key={location.id}><div className="treenode">
      <button type="button" className={`pick ${value === location.id ? "selected" : ""}`} onClick={() => onChange(location.id)}>{location.name}</button>
      <button className="expand" type="button" aria-label={`${open ? "Collapse" : "Expand"} ${location.name}`} aria-expanded={open} disabled={!hasChildren} onClick={() => onToggle(location.id)}>{open ? "−" : "+"}</button>
    </div>{open && <Tree locations={locations} value={value} expanded={expanded} onChange={onChange} onToggle={onToggle} parentId={location.id} depth={depth + 1}/>}</div>;
  })}</div>;
}
export default function LocationPicker({ locations, value, onChange, onAdd }: { locations: Location[]; value: string; onChange: (id: string) => void; onAdd?: (parentId: string | null) => Promise<boolean> }) {
  const [expanded, setExpanded] = useState<string[]>([]);
  function toggle(id: string) { setExpanded(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]); }
  async function add(parentId: string | null) { if (await onAdd?.(parentId) && parentId && !expanded.includes(parentId)) setExpanded([...expanded, parentId]); }
  return <div className="card location-picker"><Tree locations={locations} value={value} expanded={expanded} onChange={onChange} onToggle={toggle}/>{onAdd && <><button type="button" className="btnlink" onClick={() => add(null)}>+ Add room</button>{value && <button type="button" className="btnlink" onClick={() => add(value)}>+ Add inside selected</button>}</>}</div>;
}
