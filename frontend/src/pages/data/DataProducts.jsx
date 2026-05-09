import DataLayout from "./DataLayout";
import { SearchBar, SelectButton, Pagination, RowActions } from "../../components/ui";

const data = Array.from({ length: 8 }, () => ({ code: "P020", name: "Racket", category: "instrument", price: "550.00", stock: 20 }));

export default function DataProducts() {
  return (
    <DataLayout>
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Code, Name" />
        <SelectButton label="Category" />
      </div>
      <div className="grid grid-cols-[0.7fr_1fr_1fr_1fr_0.7fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>Code</div><div>Name</div><div>Category</div><div>Unit Price</div><div>Stock</div><div></div>
      </div>
      {data.map((r, i) => (
        <div key={i} className="grid grid-cols-[0.7fr_1fr_1fr_1fr_0.7fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm">
          <div className="font-semibold">{r.code}</div>
          <div className="font-semibold">{r.name}</div>
          <div>{r.category}</div>
          <div className="font-semibold">{r.price}</div>
          <div>{r.stock}</div>
          <RowActions />
        </div>
      ))}
      <Pagination />
    </DataLayout>
  );
}
