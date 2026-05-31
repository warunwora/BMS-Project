import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Trash2, Plus } from "lucide-react";
import { PageHeader, Button, SearchBar, DateRangePicker, FilterDropdown, FilterPills, Pagination, ExportDropdown, Tooltip, ConfirmModal } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

export default function SalesHistory() {
  const nav = useNavigate();
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [confirm, setConfirm] = useState(null);

  function load() {
    setLoading(true);
    get("/sales", { search }).then(setData).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search]);

  function handleDelete(id) {
    setConfirm({
      title: "Delete Receipt?",
      message: "Delete this sales receipt? This cannot be undone.",
      onConfirm: async () => {
        try { await del(`/receipts/${id}`); toast("Receipt deleted"); setData((d) => d.filter((r) => r.id !== id)); }
        catch (e) { toast(e.message, "error"); }
        setConfirm(null);
      },
    });
  }

  function handlePrintHistory() {
    const win = window.open("", "_blank", "width=900,height=650");
    const rows = filtered.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.code ?? "-"}</td>
        <td>${r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
        <td>${r.member?.name ?? "-"}</td>
        <td>${r.net_amount ?? "0.00"}</td>
        <td>${r.method ?? "-"}</td>
      </tr>`).join("");
    const total = filtered.reduce((s, r) => s + parseFloat(r.net_amount || 0), 0);
    win.document.write(`<!DOCTYPE html><html><head><title>Sales History Report</title>
      <style>
        body{font-family:sans-serif;padding:24px;color:#1e293b}
        h2{margin:0 0 4px}
        .meta{color:#64748b;font-size:13px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{text-align:left;padding:8px 12px;background:#f1f5f9;border-bottom:2px solid #e2e8f0}
        td{padding:8px 12px;border-bottom:1px solid #e2e8f0}
        tfoot td{font-weight:bold;background:#f8fafc}
        @media print{body{padding:0}}
      </style></head><body>
      <h2>Sales History Report</h2>
      <div class="meta">Printed: ${new Date().toLocaleString()} &nbsp;|&nbsp; Records: ${filtered.length}</div>
      <table>
        <thead><tr><th>#</th><th>Receipt No</th><th>Date</th><th>Member</th><th>Amount</th><th>Method</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="4">Total</td><td>${total.toFixed(2)}</td><td></td></tr></tfoot>
      </table>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  const filtered = data.filter((r) => {
    if (methodFilter && r.method !== methodFilter) return false;
    const d = r.date ? r.date.split("T")[0] : "";
    if (dateRange.from && d < dateRange.from) return false;
    if (dateRange.to && d > dateRange.to) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Sales"
        actions={
          <>
            <Button variant="primary" icon={Plus} onClick={() => nav("/sales/new")}>Add Sale</Button>
            <Tooltip text="Print a formatted sales summary">
              <Button variant="outlineBlue" icon={Printer} onClick={handlePrintHistory}>Print History</Button>
            </Tooltip>
            <ExportDropdown data={filtered} filename="sales-history" />
          </>
        }
      />
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search Receipt No., Member" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterDropdown label="Method" options={["Cash", "Card", "QR"]} value={methodFilter} onChange={setMethodFilter} />
        <DateRangePicker from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
      </div>
      <div className="mb-5">
        <FilterPills
          items={["Transaction Log", "Points Analysis"]}
          value="Transaction Log"
          onChange={(v) => v === "Points Analysis" && nav("/sales/points")}
        />
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      <div className="border-t border-slate-100">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] text-sm text-slate-400 py-4 px-2">
          <div>Receipt No</div><div>Date</div><div>Member</div><div>Total Amount</div><div>Method</div><div></div>
        </div>
        {filtered.map((r) => (
          <div key={r.id} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm hover:bg-slate-50 animate-fade-in">
            <div className="font-semibold">{r.code}</div>
            <div>{r.date ? new Date(r.date).toLocaleDateString() : "-"}</div>
            <div>{r.member?.name}</div>
            <div>{r.net_amount}</div>
            <div>{r.method}</div>
            <Tooltip text="Delete this receipt">
              <button onClick={() => handleDelete(r.id)} className="w-9 h-9 rounded-lg bg-rose-100 hover:bg-rose-200 flex items-center justify-center transition-all active:scale-90">
                <Trash2 className="w-4 h-4 text-rose-500" />
              </button>
            </Tooltip>
          </div>
        ))}
      </div>
      <Pagination />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
