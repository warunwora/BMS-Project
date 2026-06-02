import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Printer, Trash2, FileText, BarChart2 } from "lucide-react";
import { PageHeader, Button, SearchBar, DateRangePicker, FilterDropdown, FilterPills, Pagination, ExportDropdown, Tooltip, ConfirmModal } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

export default function SalesHistory() {
  const nav = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const methodFilter = searchParams.get("method") || "";
  const dateRange = { from: searchParams.get("from") || "", to: searchParams.get("to") || "" };

  function setSearch(v) { setSearchParams(p => { const n = new URLSearchParams(p); v ? n.set("search", v) : n.delete("search"); return n; }, { replace: true }); }
  function setMethodFilter(v) { setSearchParams(p => { const n = new URLSearchParams(p); v ? n.set("method", v) : n.delete("method"); return n; }, { replace: true }); }
  function setDateRange({ from, to }) { setSearchParams(p => { const n = new URLSearchParams(p); from ? n.set("from", from) : n.delete("from"); to ? n.set("to", to) : n.delete("to"); return n; }, { replace: true }); }

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

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
    if (methodFilter && r.method?.toLowerCase() !== methodFilter.toLowerCase()) return false;
    const d = r.date ? r.date.split("T")[0] : "";
    if (dateRange.from && d < dateRange.from) return false;
    if (dateRange.to && d > dateRange.to) return false;
    return true;
  });

  useEffect(() => { setPage(1); }, [methodFilter, dateRange.from, dateRange.to]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div>
      <PageHeader
        title="Sales History"
        actions={
          <>
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
          icons={{ "Transaction Log": FileText, "Points Analysis": BarChart2 }}
        />
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      <div className="border-t border-slate-100">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] text-sm text-slate-400 py-4 px-2">
          <div>Receipt No</div><div>Date</div><div>Member</div><div>Total Amount</div><div>Method</div><div></div>
        </div>
        {paged.map((r) => (
          <div key={r.id} onClick={() => nav(`/pos/receipt/${r.id}`)} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm hover:bg-slate-50 cursor-pointer animate-fade-in">
            <div className="font-semibold text-indigo-600">{r.code}</div>
            <div>{r.date ? new Date(r.date).toLocaleDateString() : "-"}</div>
            <div>{r.member?.name ?? "-"}</div>
            <div>{r.net_amount}</div>
            <div className="capitalize">{r.method ?? "-"}</div>
            <Tooltip text="Delete this receipt">
              <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} className="w-9 h-9 rounded-lg bg-rose-100 hover:bg-rose-200 flex items-center justify-center transition-all active:scale-90">
                <Trash2 className="w-4 h-4 text-rose-500" />
              </button>
            </Tooltip>
          </div>
        ))}
      </div>
      <Pagination page={page} onPage={setPage} totalRows={filtered.length} rowsPerPage={rowsPerPage} onRowsPerPage={(n) => { setRowsPerPage(n); setPage(1); }} />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
