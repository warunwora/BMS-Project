import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataLayout from "./DataLayout";
import { SearchBar, ExportDropdown, Pagination, RowActions, ConfirmModal } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

export default function DataCourts() {
  const nav = useNavigate();
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setLoading(true);
    get("/courts", { search }).then(setData).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
    setPage(1);
  }, [search]);

  function handleDelete(id, code) {
    setConfirm({
      title: "Delete Court?",
      message: `Delete court "${code}"?`,
      onConfirm: async () => {
        try { await del(`/courts/${id}`); toast("Court deleted"); setData((d) => d.filter((r) => r.id !== id)); }
        catch (e) { toast(e.message, "error"); }
        setConfirm(null);
      },
    });
  }

  return (
    <DataLayout>
      <div className="flex gap-3 mb-5 items-center">
        <SearchBar placeholder="Search by Court No, Court Code" value={search} onChange={(e) => setSearch(e.target.value)} />
      
        <div className="ml-auto"><ExportDropdown data={data} filename="courts" /></div>
      </div>
      <div className="grid grid-cols-[0.6fr_1fr_1fr_1fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>Court No</div><div>Court Code</div><div>Weekday Price</div><div>Weekend Price</div><div></div>
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {data.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((r) => (
        <div key={r.id} className="grid grid-cols-[0.6fr_1fr_1fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm hover:bg-slate-50 animate-fade-in">
          <div className="font-semibold">{r.court_no}</div>
          <div className="font-semibold">{r.court_code}</div>
          <div className="font-semibold">{r.weekday_price}</div>
          <div className="font-semibold">{r.weekend_price}</div>
          <RowActions onEdit={() => nav("/data/courts/" + r.id)} onDelete={() => handleDelete(r.id, r.court_code)} />
        </div>
      ))}
      <Pagination page={page} onPage={setPage} totalRows={data.length} rowsPerPage={rowsPerPage} onRowsPerPage={(n) => { setRowsPerPage(n); setPage(1); }} />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </DataLayout>
  );
}
