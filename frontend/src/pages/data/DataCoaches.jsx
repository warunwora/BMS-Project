import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataLayout from "./DataLayout";
import { SearchBar, FilterDropdown, Pagination, RowActions, ConfirmModal } from "../../components/ui";
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

  useEffect(() => {
    setLoading(true);
    get("/coaches", { search }).then(setData).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
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

  const specialityOptions = [...new Set(data.map((r) => r.speciality).filter(Boolean))];
  const filtered = specialityFilter ? data.filter((r) => r.speciality === specialityFilter) : data;

  return (
    <DataLayout>
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterDropdown label="Speciality" options={specialityOptions} value={specialityFilter} onChange={setSpecialityFilter} />
      </div>
      <div className="grid grid-cols-[0.5fr_1.4fr_1.4fr_1fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>Coach ID</div><div>Name</div><div>Speciality</div><div>Hourly Rate</div><div></div>
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {filtered.map((r) => (
        <div key={r.id} className="grid grid-cols-[0.5fr_1.4fr_1.4fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm hover:bg-slate-50 animate-fade-in">
          <div className="font-semibold">{r.id}</div>
          <div className="font-semibold">{r.name}</div>
          <div>{r.speciality}</div>
          <div className="font-semibold">{r.hourly_rate}</div>
          <RowActions onEdit={() => nav("/data/coaches/" + r.id)} onDelete={() => handleDelete(r.id, r.name)} />
        </div>
      ))}
      <Pagination />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </DataLayout>
  );
}
