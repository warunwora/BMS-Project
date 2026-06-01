import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataLayout from "./DataLayout";
import { SearchBar, ExportDropdown, FilterDropdown, Pagination, RowActions, ConfirmModal } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

export default function DataMembers() {
  const nav = useNavigate();
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  function load() {
    setLoading(true);
    get("/members", { search }).then(setData).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }

  useEffect(() => { load(); setPage(1); }, [search]);

  function handleDelete(id, name) {
    setConfirm({
      title: "Delete Member?",
      message: `Delete member "${name}"? This cannot be undone.`,
      onConfirm: async () => {
        try { await del(`/members/${id}`); toast("Member deleted"); setData((d) => d.filter((r) => r.id !== id)); }
        catch (e) { toast(e.message, "error"); }
        setConfirm(null);
      },
    });
  }

  const filtered = tierFilter ? data.filter((r) => r.tier_id === tierFilter) : data;

  useEffect(() => { setPage(1); }, [tierFilter]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <DataLayout>
      <div className="flex gap-3 mb-5 items-center">
        <SearchBar placeholder="Search by Name, Phone, Email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterDropdown label="Tier" options={["Bronze", "Silver", "Gold", "Premium"]} value={tierFilter} onChange={setTierFilter} />
      
        <div className="ml-auto"><ExportDropdown data={filtered} filename="members" /></div>
      </div>
      <div className="grid grid-cols-[0.5fr_1.5fr_1.5fr_0.8fr_1fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>ID</div><div>Name</div><div>Phone</div><div>Tier ID</div><div>Current Points</div><div></div>
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {!loading && filtered.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No members found.</div>}
      {paged.map((r) => (
        <div key={r.id} onClick={() => nav("/data/members/" + r.id)} className="grid grid-cols-[0.5fr_1.5fr_1.5fr_0.8fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm hover:bg-slate-50 cursor-pointer transition-colors animate-fade-in">
          <div className="font-semibold">{r.id}</div>
          <div className="font-semibold">{r.name}</div>
          <div>{r.phone}</div>
          <div>{r.tier_id}</div>
          <div>{r.points ?? 0}</div>
          <div onClick={(e) => e.stopPropagation()}>
            <RowActions onEdit={() => nav("/data/members/" + r.id)} onDelete={() => handleDelete(r.id, r.name)} />
          </div>
        </div>
      ))}
      <Pagination page={page} onPage={setPage} totalRows={filtered.length} rowsPerPage={rowsPerPage} onRowsPerPage={(n) => { setRowsPerPage(n); setPage(1); }} />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </DataLayout>
  );
}
