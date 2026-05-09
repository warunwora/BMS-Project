import { useNavigate } from "react-router-dom";
import DataLayout from "./DataLayout";
import { SearchBar, SelectButton, Pagination, RowActions } from "../../components/ui";

const data = Array.from({ length: 8 }, () => ({ id: 3, name: "Kim Joung Un", phone: "834567890", tier: 2, points: 500 }));

export default function DataMembers() {
  const nav = useNavigate();
  return (
    <DataLayout>
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Name, Phone, Email" />
        <SelectButton label="Tier" />
      </div>
      <div className="grid grid-cols-[0.5fr_1.5fr_1.5fr_0.8fr_1fr_auto] text-sm text-slate-400 py-4 px-2 border-t border-slate-100">
        <div>ID</div><div>Name</div><div>Phone</div><div>Tier ID</div><div>Current Points</div><div></div>
      </div>
      {data.map((r, i) => (
        <div key={i} onClick={() => nav("/data/members/" + r.id)} className="grid grid-cols-[0.5fr_1.5fr_1.5fr_0.8fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm hover:bg-slate-50 cursor-pointer">
          <div className="font-semibold">{r.id}</div>
          <div className="font-semibold">{r.name}</div>
          <div>{r.phone}</div>
          <div>{r.tier}</div>
          <div>{r.points}</div>
          <div onClick={(e) => e.stopPropagation()}><RowActions /></div>
        </div>
      ))}
      <Pagination />
    </DataLayout>
  );
}
