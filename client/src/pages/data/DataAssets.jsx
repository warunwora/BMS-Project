import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataLayout from "./DataLayout";
import { SearchBar, ExportDropdown, FilterDropdown, Pagination, RowActions, ConfirmModal } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

export default function DataAssets() {
  const nav = useNavigate();
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setLoading(true);
    get("/assets", { search }).then(setData).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
    setPage(1);
  }, [search]);

  function handleDelete(id, code) {
    setConfirm({
      title: "Delete Asset?",
      message: `Delete asset "${code}"?`,
      onConfirm: async () => {
        try { await del(`/assets/${id}`); toast("Asset deleted"); setData((d) => d.filter((r) => r.id !== id)); }
        catch (e) { toast(e.message, "error"); }
        setConfirm(null);
      },
    });
  }

  const typeOptions = [...new Set(data.map((r) => r.type).filter(Boolean))];
  const filtered = typeFilter ? data.filter((r) => r.type === typeFilter) : data;

  useEffect(() => { setPage(1); }, [typeFilter]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <DataLayout>
      <div className="flex gap-3 mb-5 items-center">
        <SearchBar placeholder="Search by Code, Brand" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterDropdown label="Type" options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
      
        <div className="ml-auto"><ExportDropdown data={filtered} filename="rental-assets" /></div>
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>Code</div><div>Brand</div><div>Type</div><div>Base Rate</div><div></div>
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {paged.map((r) => (
        <div key={r.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm hover:bg-slate-50 animate-fade-in">
          <div className="font-semibold">{r.code}</div>
          <div className="font-semibold">{r.brand}</div>
          <div>{r.type}</div>
          <div className="font-semibold">{r.base_rate}</div>
          <RowActions onEdit={() => nav("/data/assets/" + r.id)} onDelete={() => handleDelete(r.id, r.code)} />
        </div>
      ))}
      <Pagination page={page} onPage={setPage} totalRows={filtered.length} rowsPerPage={rowsPerPage} onRowsPerPage={(n) => { setRowsPerPage(n); setPage(1); }} />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </DataLayout>
  );
}
