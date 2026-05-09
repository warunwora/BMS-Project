import DataLayout from "./DataLayout";
import { SearchBar, SelectButton, Pagination, RowActions } from "../../components/ui";

const data = Array.from({ length: 8 }, () => ({ id: 4, name: "Thanakorn Wongsiri", spec: "Doubles Strategy", rate: "420.00" }));

export default function DataCoaches() {
  return (
    <DataLayout>
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Code, Name" />
        <SelectButton label="Speciality" />
      </div>
      <div className="grid grid-cols-[0.5fr_1.4fr_1.4fr_1fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>Coach ID</div><div>Name</div><div>Speciality</div><div>Hourly Rate</div><div></div>
      </div>
      {data.map((r, i) => (
        <div key={i} className="grid grid-cols-[0.5fr_1.4fr_1.4fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm">
          <div className="font-semibold">{r.id}</div>
          <div className="font-semibold">{r.name}</div>
          <div>{r.spec}</div>
          <div className="font-semibold">{r.rate}</div>
          <RowActions />
        </div>
      ))}
      <Pagination />
    </DataLayout>
  );
}
