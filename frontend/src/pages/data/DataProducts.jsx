import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataLayout from "./DataLayout";
import { SearchBar, FilterDropdown, Pagination, RowActions, ConfirmModal } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

export default function DataProducts() {
  const nav = useNavigate();
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    setLoading(true);
    get("/products", { search }).then(setData).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }, [search]);

  function handleDelete(id, name) {
    setConfirm({
      title: "Delete Product?",
      message: `Delete product "${name}"?`,
      onConfirm: async () => {
        try { await del(`/products/${id}`); toast("Product deleted"); setData((d) => d.filter((r) => r.id !== id)); }
        catch (e) { toast(e.message, "error"); }
        setConfirm(null);
      },
    });
  }

  const catOptions = [...new Set(data.map((r) => r.category).filter(Boolean))];
  const filtered = catFilter ? data.filter((r) => r.category === catFilter) : data;

  return (
    <DataLayout>
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Code, Name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterDropdown label="Category" options={catOptions} value={catFilter} onChange={setCatFilter} />
      </div>
      <div className="grid grid-cols-[0.7fr_1fr_1fr_1fr_0.7fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>Code</div><div>Name</div><div>Category</div><div>Unit Price</div><div>Stock</div><div></div>
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {filtered.map((r) => (
        <div key={r.id} className="grid grid-cols-[0.7fr_1fr_1fr_1fr_0.7fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm hover:bg-slate-50 animate-fade-in">
          <div className="font-semibold">{r.code}</div>
          <div className="font-semibold">{r.name}</div>
          <div>{r.category}</div>
          <div className="font-semibold">{r.unit_price}</div>
          <div>{r.stock}</div>
          <RowActions onEdit={() => nav("/data/products/" + r.id)} onDelete={() => handleDelete(r.id, r.name)} />
        </div>
      ))}
      <Pagination />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </DataLayout>
  );
}
