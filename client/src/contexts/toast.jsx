import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastCtx = createContext(null);

const META = {
  success: { icon: CheckCircle2, bg: "bg-emerald-500" },
  error:   { icon: XCircle,       bg: "bg-rose-500" },
  warning: { icon: AlertTriangle, bg: "bg-amber-500" },
  info:    { icon: Info,          bg: "bg-indigo-500" },
};

function ToastItem({ id, msg, type, onRemove }) {
  const { icon: Icon, bg } = META[type] || META.success;
  return (
    <div className={`flex items-center gap-3 ${bg} text-white px-4 py-3 rounded-xl shadow-xl min-w-72 max-w-sm animate-slide-up`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium flex-1">{msg}</span>
      <button onClick={() => onRemove(id)} className="opacity-70 hover:opacity-100 ml-1 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
