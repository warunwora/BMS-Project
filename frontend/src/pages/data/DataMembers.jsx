import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataLayout from "./DataLayout";
import { SearchBar, FilterDropdown, Pagination, RowActions, ConfirmModal } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

export default function DataMembers() {
  const nav = useNavigate();
  const toast = useToast();
  const [data, setData] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [confirm, setConfirm] = useState(null);

  function load() {
    setLoading(true);
    get("/members", { search }).then(setData).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }

  // Load tiers on mount
  useEffect(() => {
    get("/tiers")
      .then(setTiers)
      .catch((e) => toast(e.message, "error"));
  }, []);

  useEffect(() => { load(); }, [search]);

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

  const filtered = tierFilter ? data.filter((r) => r.tier_name === tierFilter) : data;

  return (
    <DataLayout>
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Name, Phone, Email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterDropdown 
          label="Tier" 
          options={tiers.map((t) => t.name)} 
          value={tierFilter} 
          onChange={setTierFilter} 
        />
      </div>
      <div className="grid grid-cols-[0.5fr_1.5fr_1.5fr_0.8fr_1fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>ID</div><div>Name</div><div>Phone</div><div>Tier</div><div>Current Points</div><div></div>
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {!loading && filtered.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No members found.</div>}
      {filtered.map((r) => (
        <div key={r.id} onClick={() => nav("/data/members/" + r.id)} className="grid grid-cols-[0.5fr_1.5fr_1.5fr_0.8fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm hover:bg-slate-50 cursor-pointer transition-colors animate-fade-in">
          <div className="font-semibold">{r.id}</div>
          <div className="font-semibold">{r.name}</div>
          <div>{r.phone}</div>
          <div>{r.tier_name}</div>
          <div>{r.points ?? 0}</div>
          <div onClick={(e) => e.stopPropagation()}>
            <RowActions onEdit={() => nav("/data/members/" + r.id)} onDelete={() => handleDelete(r.id, r.name)} />
          </div>
        </div>
      ))}
      <Pagination />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </DataLayout>
  );
}
