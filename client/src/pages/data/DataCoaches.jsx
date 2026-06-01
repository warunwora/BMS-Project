import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataLayout from "./DataLayout";
import { SearchBar, ExportDropdown, FilterDropdown, Pagination, RowActions, ConfirmModal } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

export default function DataCoaches() {
  const nav = useNavigate();
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setLoading(true);
    get("/coaches", { search }).then(setData).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
    setPage(1);
  }, [search]);

  function handleDelete(id, name) {
    setConfirm({
      title: "Delete Coach?",
      message: `Delete coach "${name}"?`,
      onConfirm: async () => {
        try { await del(`/coaches/${id}`); toast("Coach deleted"); setData((d) => d.filter((r) => r.id !== id)); }
        catch (e) { toast(e.message, "error"); }
        setConfirm(null);
      },
    });
  }

  const specialityOptions = [...new Set(data.map((r) => (r.speciality||"").trim()).filter((s) => s && s.length > 1))].sort();
  const filtered = specialityFilter ? data.filter((r) => (r.speciality||"").trim() === specialityFilter) : data;

  useEffect(() => { setPage(1); }, [specialityFilter]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <DataLayout>
      <div className="flex gap-3 mb-5 items-center">
        <SearchBar placeholder="Search by Name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterDropdown label="Speciality" options={specialityOptions} value={specialityFilter} onChange={setSpecialityFilter} />
      
        <div className="ml-auto"><ExportDropdown data={filtered} filename="coaches" /></div>
      </div>
      <div className="grid grid-cols-[0.5fr_1.4fr_1.4fr_1fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>Coach ID</div><div>Name</div><div>Speciality</div><div>Hourly Rate</div><div></div>
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {paged.map((r) => (
        <div key={r.id} className="grid grid-cols-[0.5fr_1.4fr_1.4fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm hover:bg-slate-50 animate-fade-in">
          <div className="font-semibold">{r.id}</div>
          <div className="font-semibold">{r.name}</div>
          <div>{r.speciality}</div>
          <div className="font-semibold">{r.hourly_rate}</div>
          <RowActions onEdit={() => nav("/data/coaches/" + r.id)} onDelete={() => handleDelete(r.id, r.name)} />
        </div>
      ))}
      <Pagination page={page} onPage={setPage} totalRows={filtered.length} rowsPerPage={rowsPerPage} onRowsPerPage={(n) => { setRowsPerPage(n); setPage(1); }} />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </DataLayout>
  );
}
