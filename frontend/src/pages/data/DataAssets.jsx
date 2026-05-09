import DataLayout from "./DataLayout";
import { SearchBar, SelectButton, Pagination, RowActions } from "../../components/ui";

const data = Array.from({ length: 8 }, () => ({ code: "R004", brand: "Asics", type: "shoes", rate: "70.00" }));

export default function DataAssets() {
  return (
    <DataLayout>
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Code, Brand" />
        <SelectButton label="Type" />
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>Code</div><div>Brand</div><div>Type</div><div>Base Rate</div><div></div>
      </div>
      {data.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm">
          <div className="font-semibold">{r.code}</div>
          <div className="font-semibold">{r.brand}</div>
          <div>{r.type}</div>
          <div className="font-semibold">{r.rate}</div>
          <RowActions />
        </div>
      ))}
      <Pagination />
    </DataLayout>
  );
}
