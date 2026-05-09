import { Search, Calendar, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PageTitle({ title, back, children }) {
  const nav = useNavigate();
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {back && (
          <button onClick={() => nav(-1)} className="text-slate-700 hover:text-slate-900">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {children && <div className="mt-1">{children}</div>}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, actions }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <div className="flex gap-2">{actions}</div>
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", icon: Icon, ...props }) {
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50",
    outlineBlue: "border border-indigo-200 text-indigo-600 bg-white hover:bg-indigo-50",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
    dangerOutline: "border border-rose-300 text-rose-600 bg-white hover:bg-rose-50",
    ghost: "text-slate-700 hover:bg-slate-100",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition ${styles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function SearchBar({ placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
}

export function DateRangeButton() {
  return (
    <button className="inline-flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white">
      <Calendar className="w-4 h-4" />
      Date Range
    </button>
  );
}

export function SelectButton({ label }) {
  return (
    <button className="inline-flex items-center justify-between gap-3 px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white min-w-[140px]">
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
          className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
            value === it
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
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
      className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${className}`}
      {...props}
    />
  );
}

export function Select({ children, className = "", ...props }) {
  return (
    <div className="relative">
      <select
        className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white appearance-none pr-10 ${className}`}
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
      <button onClick={onEdit} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
        <Pencil className="w-4 h-4 text-slate-700" />
      </button>
      <button onClick={onDelete} className="w-9 h-9 rounded-lg bg-rose-100 hover:bg-rose-200 flex items-center justify-center">
        <Trash2 className="w-4 h-4 text-rose-500" />
      </button>
    </div>
  );
}

export function Pagination() {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-slate-500">Page 1 of 1</div>
      <div className="flex gap-2">
        {[ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight].map((Ic, i) => (
          <button key={i} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
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

export function Table({ columns, rows, onRowClick }) {
  return (
    <div className="border-t border-slate-100">
      <div
        className="grid items-center text-sm text-slate-400 py-4 px-2"
        style={{ gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" ") + " auto" }}
      >
        {columns.map((c) => (
          <div key={c.key}>{c.label}</div>
        ))}
        <div></div>
      </div>
      <div className="flex flex-col">
        {rows.map((row, i) => (
          <div
            key={i}
            onClick={() => onRowClick?.(row)}
            className="grid items-center py-4 px-2 border-t border-slate-100 hover:bg-slate-50 cursor-pointer text-sm"
            style={{ gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" ") + " auto" }}
          >
            {columns.map((c) => (
              <div key={c.key} className={c.cls || "text-slate-900 font-medium"}>
                {c.render ? c.render(row) : row[c.key]}
              </div>
            ))}
            <div onClick={(e) => e.stopPropagation()}>
              <RowActions />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Plus };
