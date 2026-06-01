import { NavLink, Outlet } from "react-router-dom";
import { Trophy, ShoppingCart, Wrench, Clock, Monitor, ShoppingBag, FileText } from "lucide-react";
import { Tooltip } from "../components/ui";

const mainItems = [
  { to: "/booking",     label: "Court Booking",       icon: Trophy,       tip: "Manage court reservations" },
  { to: "/rental",      label: "Equipment Rental",    icon: ShoppingCart, tip: "Rent equipment to members" },
  { to: "/restringing", label: "Restringing Service", icon: Wrench,       tip: "Manage restringing work orders" },
  { to: "/coaching",    label: "Coaching Session",    icon: Clock,        tip: "Book and track coaching sessions" },
  { to: "/sales",       label: "Shop Sales",               icon: Monitor,      tip: "Sales transactions and analytics" },
];

const dataItems = [
  { to: "/data",  label: "Data Management", icon: FileText,    tip: "Members, courts, assets, products, coaches" },
];

function NavItem({ to, label, icon: Icon, tip }) {
  return (
    <Tooltip text={tip} position="right">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2.5 rounded-lg text-[15px] transition-all duration-150 w-full ${
            isActive ? "bg-indigo-50 text-indigo-600 font-medium" : "text-slate-700 hover:bg-slate-50"
          }`
        }
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </NavLink>
    </Tooltip>
  );
}

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-white">
      <aside className="w-64 border-r border-slate-200 flex flex-col py-6 px-3">
        <div className="px-4 mb-3 text-xs uppercase tracking-wider text-slate-400">Main Service</div>
        <nav className="flex flex-col gap-1">
          {mainItems.map((i) => <NavItem key={i.to} {...i} />)}
        </nav>
        <div className="px-4 mt-6 mb-3 text-xs uppercase tracking-wider text-slate-400">Data Management</div>
        <nav className="flex flex-col gap-1">
          {dataItems.map((i) => <NavItem key={i.to} {...i} />)}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-100 flex items-center justify-end px-8">
          <div className="flex items-center gap-3 border border-slate-200 rounded-full pl-1 pr-4 py-1 hover:border-slate-300 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-300" />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">Admin</div>
              <div className="text-xs text-slate-500">A001</div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
