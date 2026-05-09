import DataLayout from "./DataLayout";
import { SearchBar, Pagination, RowActions } from "../../components/ui";

const data = Array.from({ length: 8 }, () => ({ no: 7, code: "C007", weekday: "250.00", weekend: "300.00" }));

export default function DataCourts() {
  return (
    <DataLayout>
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Court No, Court Code" />
      </div>
      <div className="grid grid-cols-[0.6fr_1fr_1fr_1fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>Court No</div><div>Court Code</div><div>Weekday Price</div><div>Weekend Price</div><div></div>
      </div>
      {data.map((r, i) => (
        <div key={i} className="grid grid-cols-[0.6fr_1fr_1fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm">
          <div className="font-semibold">{r.no}</div>
          <div className="font-semibold">{r.code}</div>
          <div className="font-semibold">{r.weekday}</div>
          <div className="font-semibold">{r.weekend}</div>
          <RowActions />
        </div>
      ))}
      <Pagination />
    </DataLayout>
  );
}
