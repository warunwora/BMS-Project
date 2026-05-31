import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Search, Calendar, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Pencil, Trash2, Plus, ChevronDown, X, AlertTriangle, Download, FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PageTitle({ title, back, children }) {
  const nav = useNavigate();
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {back && (
          <button onClick={() => nav(-1)} className="text-slate-700 hover:text-slate-900 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div className="animate-fade-in-down">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {children && <div className="mt-1">{children}</div>}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, actions }) {
  return (
    <div className="flex items-center justify-between mb-6 animate-fade-in-down">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <div className="flex gap-2 no-print">{actions}</div>
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", icon: Icon, ...props }) {
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md",
    outline: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400",
    outlineBlue: "border border-indigo-200 text-indigo-600 bg-white hover:bg-indigo-50 hover:border-indigo-400",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm hover:shadow-md",
    dangerOutline: "border border-rose-300 text-rose-600 bg-white hover:bg-rose-50 hover:border-rose-400",
    ghost: "text-slate-700 hover:bg-slate-100",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-95 ${styles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="animate-text-in">{children}</span>
    </button>
  );
}

export function SearchBar({ placeholder = "Search...", className = "", value, onChange }) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
      />
    </div>
  );
}

export function DateRangeButton() {
  return (
    <button className="inline-flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white hover:border-slate-300 transition">
      <Calendar className="w-4 h-4" />
      Date Range
    </button>
  );
}

export function SelectButton({ label }) {
  return (
    <button className="inline-flex items-center justify-between gap-3 px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white min-w-[140px] hover:border-slate-300 transition">
      <span>{label}</span>
      <ChevronsUpDown className="w-4 h-4 text-slate-400" />
    </button>
  );
}

export function FilterPills({ items, value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((it) => (
        <button
          key={it}
          onClick={() => onChange?.(it)}
          className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-150 active:scale-95 ${value === it
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
        >
          {it}
        </button>
      ))}
    </div>
  );
}

export function Card({ title, children, action }) {
  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-white">
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-slate-500">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition ${className}`}
      {...props}
    />
  );
}

export function Select({ children, className = "", ...props }) {
  return (
    <div className="relative">
      <select
        className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronsUpDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      {onEdit && (
        <Tooltip text="Edit">
          <button onClick={onEdit} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all active:scale-90">
            <Pencil className="w-4 h-4 text-slate-700" />
          </button>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip text="Delete">
          <button onClick={onDelete} className="w-9 h-9 rounded-lg bg-rose-100 hover:bg-rose-200 flex items-center justify-center transition-all active:scale-90">
            <Trash2 className="w-4 h-4 text-rose-500" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}

export function Pagination({ page = 1, total = 1, onPage }) {
  return (
    <div className="sticky bottom-0 z-10 bg-white border-t border-slate-100 py-4 mt-6 flex items-center justify-between">
      <div className="text-sm text-slate-500">Page {page} of {total}</div>
      <div className="flex gap-2">
        {[
          [ChevronsLeft, () => onPage?.(1)],
          [ChevronLeft, () => onPage?.(Math.max(1, page - 1))],
          [ChevronRight, () => onPage?.(Math.min(total, page + 1))],
          [ChevronsRight, () => onPage?.(total)],
        ].map(([Ic, handler], i) => (
          <button key={i} onClick={handler} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90">
            <Ic className="w-4 h-4 text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function StatusText({ children, color = "indigo" }) {
  const colors = {
    indigo: "text-indigo-600",
    green: "text-emerald-600",
    rose: "text-rose-500",
    amber: "text-amber-600",
    slate: "text-slate-600",
  };
  return <span className={`font-medium ${colors[color]}`}>{children}</span>;
}

export function Table({ columns, rows, onRowClick, onEdit, onDelete }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    })
    : rows;

  const gridTpl = columns.map((c) => c.width || "1fr").join(" ") + " auto";

  return (
    <div className="border-t border-slate-100">
      <div className="grid items-center text-sm py-4 px-2" style={{ gridTemplateColumns: gridTpl }}>
        {columns.map((c) => (
          <button
            key={c.key}
            onClick={() => handleSort(c.key)}
            className={`text-left flex items-center gap-1 select-none transition-colors hover:text-slate-700 group ${sortKey === c.key ? "text-indigo-500" : "text-slate-400"}`}
          >
            {c.label}
            {sortKey === c.key
              ? <span className="text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>
              : <ChevronsUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />}
          </button>
        ))}
        <div></div>
      </div>
      <div className="flex flex-col">
        {sorted.map((row, i) => (
          <div
            key={i}
            onClick={() => onRowClick?.(row)}
            className="grid items-center py-4 px-2 border-t border-slate-100 hover:bg-slate-50 cursor-pointer text-sm transition-colors animate-fade-in"
            style={{ gridTemplateColumns: gridTpl, animationDelay: `${i * 30}ms` }}
          >
            {columns.map((c) => (
              <div key={c.key} className={c.cls || "text-slate-900 font-medium"}>
                {c.render ? c.render(row) : row[c.key]}
              </div>
            ))}
            <div onClick={(e) => e.stopPropagation()}>
              <RowActions
                onEdit={onEdit ? () => onEdit(row) : undefined}
                onDelete={onDelete ? () => onDelete(row) : undefined}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── New shared components ─────────────────────────────────────────────────────

export function Tooltip({ children, text, position = "top" }) {
  if (!text) return children;
  const posClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };
  const arrowClass = {
    top: "absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800",
    bottom: "absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-slate-800",
    left: "absolute left-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-l-slate-800",
    right: "absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-800",
  };
  return (
    <div className="relative group inline-flex">
      {children}
      <div className={`pointer-events-none absolute ${posClass[position]} px-2.5 py-1 text-xs text-white bg-slate-800 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 shadow-lg`}>
        {text}
        <div className={arrowClass[position]} />
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, message, confirmText = "Confirm", onConfirm, onCancel, variant = "danger" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-fade-in" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}

export function FilterDropdown({ label, options = [], value, onChange }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const btnRef = useRef(null);

  useEffect(() => {
    function outside(e) {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  function toggle() {
    if (!open) setRect(btnRef.current?.getBoundingClientRect());
    setOpen((v) => !v);
  }

  const active = value && value !== "All" && value !== "";

  return (
    <div ref={btnRef}>
      <Tooltip text={`Filter by ${label}`}>
        <button
          onClick={toggle}
          className={`inline-flex items-center justify-between gap-3 px-4 py-3 border rounded-xl text-sm bg-white min-w-[140px] transition-all active:scale-95 ${active ? "border-indigo-400 text-indigo-600" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}
        >
          <span className="truncate">{active ? value : label}</span>
          <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </Tooltip>
      {open && rect && createPortal(
        <div
          style={{ position: "fixed", top: rect.bottom + 4, right: window.innerWidth - rect.right, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px] animate-fade-in"
        >
          {["All", ...options].map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt === "All" ? "" : opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-slate-50 ${(active ? value === opt : opt === "All") ? "text-indigo-600 font-medium bg-indigo-50" : "text-slate-700"}`}
            >
              {opt}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

export function DateRangePicker({ from, to, onChange }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const btnRef = useRef(null);

  useEffect(() => {
    function outside(e) {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  function toggle() {
    if (!open) setRect(btnRef.current?.getBoundingClientRect());
    setOpen((v) => !v);
  }

  const hasRange = from || to;

  return (
    <div ref={btnRef}>
      <Tooltip text="Filter by date range">
        <button
          onClick={toggle}
          className={`inline-flex items-center gap-2 px-4 py-3 border rounded-xl text-sm bg-white transition-all active:scale-95 ${hasRange ? "border-indigo-400 text-indigo-600" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}
        >
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">
            {from && to ? `${from} → ${to}` : from ? `From ${from}` : to ? `To ${to}` : "Date Range"}
          </span>
          {hasRange && (
            <X
              className="w-3.5 h-3.5 ml-1 hover:text-rose-500 transition-colors"
              onClick={(e) => { e.stopPropagation(); onChange({ from: "", to: "" }); }}
            />
          )}
        </button>
      </Tooltip>
      {open && rect && createPortal(
        <div
          style={{ position: "fixed", top: rect.bottom + 4, right: window.innerWidth - rect.right, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex gap-4 animate-fade-in"
        >
          <div>
            <label className="text-xs text-slate-500 block mb-1.5 font-medium">From</label>
            <input
              type="date"
              value={from || ""}
              onChange={(e) => onChange({ from: e.target.value, to })}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1.5 font-medium">To</label>
            <input
              type="date"
              value={to || ""}
              onChange={(e) => onChange({ from, to: e.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="self-end pb-0.5">
            <button onClick={() => { onChange({ from: "", to: "" }); setOpen(false); }} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Clear
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function ExportDropdown({ data = [], filename = "export", onPrint }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    function outside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  function handleCSV() {
    if (!data || !data.length) return;
    const flatData = data.map((row) => {
      const flat = {};
      for (const [k, v] of Object.entries(row)) {
        if (v !== null && typeof v !== "object") flat[k] = v;
      }
      return flat;
    });
    const keys = Object.keys(flatData[0] || {});
    const csv = [
      keys.join(","),
      ...flatData.map((r) => keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  async function handlePDF() {
    if (!data || !data.length) return;
    const flatData = data.map((row) => {
      const flat = {};
      for (const [k, v] of Object.entries(row)) {
        if (v !== null && typeof v !== "object") flat[k] = v;
      }
      return flat;
    });
    const keys = Object.keys(flatData[0] || {});
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(filename, 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [keys],
      body: flatData.map((r) => keys.map((k) => String(r[k] ?? ""))),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
    });
    doc.save(`${filename}.pdf`);
    setOpen(false);
  }

  function toggle() {
    if (!open) setRect(ref.current?.getBoundingClientRect());
    setOpen((v) => !v);
  }

  return (
    <div ref={ref}>
      <Tooltip text="Export data">
        <button
          onClick={toggle}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-indigo-200 text-indigo-600 bg-white hover:bg-indigo-50 hover:border-indigo-400 rounded-xl font-medium text-sm transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export as</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </Tooltip>
      {open && rect && createPortal(
        <div
          style={{ position: "fixed", top: rect.bottom + 4, right: window.innerWidth - rect.right, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px] animate-fade-in"
        >
          <button onMouseDown={(e) => { e.preventDefault(); handleCSV(); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <FileText className="w-4 h-4 text-emerald-500" />
            Export CSV
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); handlePDF(); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <FileText className="w-4 h-4 text-rose-500" />
            Export PDF
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

export function MemberSearch({ onSelect, selected, placeholder = "Search name, ID or phone" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function outside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  // useEffect(() => {
  //   const q = query.trim();
  //   const timer = setTimeout(async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetch(`/api/members?search=${encodeURIComponent(q)}`);
  //       const data = await res.json();
  //       setResults(Array.isArray(data) ? data : []);
  //       setRect(inputRef.current?.getBoundingClientRect());
  //     } catch { setResults([]); }
  //     finally { setLoading(false); }
  //   }, q ? 250 : 0);
  //   return () => clearTimeout(timer);
  // }, [query]);
 const fetchResults = useCallback(async (q = query) => {
 try {
 setLoading(true);
 const res = await fetch(`/api/members?search=${encodeURIComponent(q.trim())}`);
 const data = await res.json();
 setResults(Array.isArray(data) ? data : []);
 setRect(inputRef.current?.getBoundingClientRect());
 } catch { setResults([]); }
 finally { setLoading(false); }
 }, [query]);

 useEffect(() => {
 const timer = setTimeout(() => fetchResults(), query ? 250 : 0);
 return () => clearTimeout(timer);
 }, [query]);

  function handleSelect(m) {
    onSelect(m);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleClear() { onSelect(null); setQuery(""); setResults([]); setOpen(false); }

 function handleFocus() {
 setOpen(true);
 setRect(inputRef.current?.getBoundingClientRect());
 fetchResults(query); 
 }

  return (
    <div ref={containerRef}>
      {selected ? (
        <div className="flex items-center gap-3 px-4 py-2.5 border border-indigo-300 rounded-xl bg-indigo-50">
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-indigo-700 text-sm">{selected.name}</span>
            <span className="text-indigo-400 text-sm ml-2">{selected.phone}</span>
            {selected.tier_id && <span className="ml-2 text-xs text-indigo-400">({selected.tier_id})</span>}
          </div>
          <button onClick={handleClear} className="text-indigo-300 hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
          />
          {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">...</div>}
        </div>
      )}
      {open && results.length > 0 && rect && createPortal(
        <div
          style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in"
        >
          <div className="grid text-xs text-slate-400 px-4 py-2 border-b border-slate-100" style={{ gridTemplateColumns: "2fr 1.5fr 1fr 0.8fr" }}>
            <div>Name</div><div>Phone</div><div>Tier</div><div>Points</div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {results.map((m) => (
              <button
                key={m.id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(m); }}
                className="w-full text-left grid px-4 py-3 hover:bg-indigo-50 text-sm border-b border-slate-100 last:border-0 transition-colors"
                style={{ gridTemplateColumns: "2fr 1.5fr 1fr 0.8fr" }}
              >
                <div className="font-semibold text-slate-900 truncate">{m.name}</div>
                <div className="text-slate-500">{m.phone}</div>
                <div className="text-slate-500">{m.tier_id}</div>
                <div className="text-indigo-500 font-medium">{m.points ?? 0}</div>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function CoachSearch({ onSelect, selected }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function outside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/coaches?search=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setRect(inputRef.current?.getBoundingClientRect());
      } catch { setResults([]); }
    }, q ? 250 : 0);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(c) { onSelect(c); setQuery(""); setResults([]); setOpen(false); }
  function handleClear() { onSelect(null); setQuery(""); setResults([]); setOpen(false); }

  function handleFocus() {
    setOpen(true);
    setRect(inputRef.current?.getBoundingClientRect());
  }

  return (
    <div ref={containerRef}>
      {selected ? (
        <div className="flex items-center gap-3 px-4 py-2.5 border border-indigo-300 rounded-xl bg-indigo-50">
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-indigo-700 text-sm">{selected.name}</span>
            <span className="text-indigo-400 text-sm ml-2">{selected.speciality}</span>
            {selected.hourly_rate && <span className="ml-2 text-xs text-indigo-400">฿{selected.hourly_rate}/hr</span>}
          </div>
          <button onClick={handleClear} className="text-indigo-300 hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Search coach name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
      {open && results.length > 0 && rect && createPortal(
        <div
          style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in"
        >
          <div className="grid text-xs text-slate-400 px-4 py-2 border-b border-slate-100" style={{ gridTemplateColumns: "2fr 1.5fr 1fr" }}>
            <div>Name</div><div>Speciality</div><div>Rate/hr</div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {results.map((c) => (
              <button
                key={c.id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(c); }}
                className="w-full text-left grid px-4 py-3 hover:bg-indigo-50 text-sm border-b border-slate-100 last:border-0 transition-colors"
                style={{ gridTemplateColumns: "2fr 1.5fr 1fr" }}
              >
                <div className="font-semibold text-slate-900">{c.name}</div>
                <div className="text-slate-500">{c.speciality}</div>
                <div className="text-indigo-500 font-medium">฿{c.hourly_rate}</div>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function TechnicianSearch({ onSelect, selected, placeholder = "Search technician name, ID or phone" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function outside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const fetchResults = useCallback(async (q = query) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/technicians?search=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setRect(inputRef.current?.getBoundingClientRect());
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(), query ? 250 : 0);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(t) { onSelect(t); setQuery(""); setResults([]); setOpen(false); }
  function handleClear() { onSelect(null); setQuery(""); setResults([]); setOpen(false); }
  function handleFocus() {
    setOpen(true);
    setRect(inputRef.current?.getBoundingClientRect());
    fetchResults(query);
  }

  return (
    <div ref={containerRef}>
      {selected ? (
        <div className="flex items-center gap-3 px-4 py-2.5 border border-indigo-300 rounded-xl bg-indigo-50">
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-indigo-700 text-sm">{selected.name}</span>
            <span className="text-indigo-400 text-sm ml-2">{selected.code}</span>
            {selected.phone && <span className="ml-2 text-xs text-indigo-400">{selected.phone}</span>}
          </div>
          <button onClick={handleClear} className="text-indigo-300 hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
          />
          {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">...</div>}
        </div>
      )}
      {open && results.length > 0 && rect && createPortal(
        <div
          style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in"
        >
          <div className="grid text-xs text-slate-400 px-4 py-2 border-b border-slate-100" style={{ gridTemplateColumns: "2fr 0.8fr 1.2fr" }}>
            <div>Name</div><div>Code</div><div>Phone</div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {results.map((t) => (
              <button
                key={t.id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(t); }}
                className="w-full text-left grid px-4 py-3 hover:bg-indigo-50 text-sm border-b border-slate-100 last:border-0 transition-colors"
                style={{ gridTemplateColumns: "2fr 0.8fr 1.2fr" }}
              >
                <div className="font-semibold text-slate-900 truncate">{t.name}</div>
                <div className="text-slate-500">{t.code}</div>
                <div className="text-slate-500">{t.phone}</div>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function ProductSearch({ onSelect, selected, placeholder = "Search product name or code", label = "Product" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function outside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const fetchResults = useCallback(async (q = query) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?search=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setRect(inputRef.current?.getBoundingClientRect());
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(), query ? 250 : 0);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(p) { onSelect(p); setQuery(""); setResults([]); setOpen(false); }
  function handleClear() { onSelect(null); setQuery(""); setResults([]); setOpen(false); }
  function handleFocus() {
    setOpen(true);
    setRect(inputRef.current?.getBoundingClientRect());
    fetchResults(query);
  }

  return (
    <div ref={containerRef}>
      {selected ? (
        <div className="flex items-center gap-3 px-4 py-2.5 border border-indigo-300 rounded-xl bg-indigo-50">
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-indigo-700 text-sm">{selected.name}</span>
            <span className="text-indigo-400 text-sm ml-2">{selected.code}</span>
            {selected.unit_price != null && <span className="ml-2 text-xs text-indigo-400">฿{selected.unit_price}</span>}
          </div>
          <button onClick={handleClear} className="text-indigo-300 hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
          />
          {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">...</div>}
        </div>
      )}
      {open && results.length > 0 && rect && createPortal(
        <div
          style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in"
        >
          <div className="grid text-xs text-slate-400 px-4 py-2 border-b border-slate-100" style={{ gridTemplateColumns: "2fr 0.8fr 1fr 0.8fr" }}>
            <div>Name</div><div>Code</div><div>Category</div><div>Price</div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {results.map((p) => (
              <button
                key={p.id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(p); }}
                className="w-full text-left grid px-4 py-3 hover:bg-indigo-50 text-sm border-b border-slate-100 last:border-0 transition-colors"
                style={{ gridTemplateColumns: "2fr 0.8fr 1fr 0.8fr" }}
              >
                <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                <div className="text-slate-500">{p.code}</div>
                <div className="text-slate-500">{p.category}</div>
                <div className="text-indigo-500 font-medium">฿{p.unit_price ?? 0}</div>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export { Plus };
