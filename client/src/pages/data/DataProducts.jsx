import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataLayout from "./DataLayout";
import { SearchBar, ExportDropdown, FilterDropdown, Pagination, RowActions, ConfirmModal } from "../../components/ui";
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
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setLoading(true);
    get("/products", { search }).then(setData).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
    setPage(1);
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

  useEffect(() => { setPage(1); }, [catFilter]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <DataLayout>
      <div className="flex gap-3 mb-5 items-center">
        <SearchBar placeholder="Search by Code, Name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterDropdown label="Category" options={catOptions} value={catFilter} onChange={setCatFilter} />
      
        <div className="ml-auto"><ExportDropdown data={filtered} filename="products" /></div>
      </div>
      <div className="grid grid-cols-[0.7fr_1fr_1fr_1fr_0.7fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>Code</div><div>Name</div><div>Category</div><div>Unit Price</div><div>Stock</div><div></div>
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {paged.map((r) => (
        <div key={r.id} className="grid grid-cols-[0.7fr_1fr_1fr_1fr_0.7fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm hover:bg-slate-50 animate-fade-in">
          <div className="font-semibold">{r.code}</div>
          <div className="font-semibold">{r.name}</div>
          <div>{r.category}</div>
          <div className="font-semibold">{r.unit_price}</div>
          <div>{r.stock}</div>
          <RowActions onEdit={() => nav("/data/products/" + r.id)} onDelete={() => handleDelete(r.id, r.name)} />
        </div>
      ))}
      <Pagination page={page} onPage={setPage} totalRows={filtered.length} rowsPerPage={rowsPerPage} onRowsPerPage={(n) => { setRowsPerPage(n); setPage(1); }} />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </DataLayout>
  );
}
