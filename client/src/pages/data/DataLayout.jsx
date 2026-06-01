import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Trophy, ShoppingCart, ShoppingBag, Target } from "lucide-react";
import { Button } from "../../components/ui";

const tabs = [
  { to: "/data/members", label: "Members", icon: User, newTo: "/data/members/new" },
  { to: "/data/courts", label: "Courts", icon: Trophy, newTo: "/data/courts/new" },
  { to: "/data/assets", label: "Rental Assets", icon: ShoppingCart, newTo: "/data/assets/new" },
  { to: "/data/products", label: "Products", icon: ShoppingBag, newTo: "/data/products/new" },
  { to: "/data/coaches", label: "Coaches", icon: Target, newTo: "/data/coaches/new" },
];

export default function DataLayout({ children }) {
  const nav = useNavigate();
  const loc = useLocation();
  const current = tabs.find((t) => loc.pathname.startsWith(t.to)) || tabs[0];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Data Management</h1>
        <div className="relative" ref={ref}>
          <Button onClick={() => setOpen((p) => !p)}>
            <span className="flex items-center gap-1">New <ChevronDown className="w-4 h-4" /></span>
          </Button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {tabs.map((t) => {
                const Ic = t.icon;
                return (
                  <button
                    key={t.to}
                    onClick={() => { setOpen(false); nav(t.newTo); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Ic className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        {tabs.map((t) => {
          const active = loc.pathname.startsWith(t.to);
          const Ic = t.icon;
          return (
            <NavLink
              key={t.to}
              to={t.to}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium ${
                active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              <Ic className="w-4 h-4" />
              {t.label}
            </NavLink>
          );
        })}
      </div>
      {children}
    </div>
  );
}
