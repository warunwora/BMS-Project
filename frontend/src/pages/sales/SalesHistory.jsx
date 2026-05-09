import { useNavigate, useLocation } from "react-router-dom";
import { Printer, Send, Trash2 } from "lucide-react";
import { PageHeader, Button, SearchBar, DateRangeButton, SelectButton, FilterPills, Pagination } from "../../components/ui";

const data = Array.from({ length: 8 }, (_, i) => ({
  no: "PO20260205-01",
  date: "22/03/2026",
  member: "Lee Chong",
  amount: "0.00",
  method: "Cash",
}));

export default function SalesHistory() {
  const nav = useNavigate();
  return (
    <div>
      <PageHeader
        title="Sales History"
        actions={
          <>
            <Button variant="outlineBlue" icon={Printer}>Print History</Button>
            <Button variant="outlineBlue" icon={Send}>Export as</Button>
          </>
        }
      />
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search Receipt No., Member" />
        <SelectButton label="Method" />
        <DateRangeButton />
      </div>
      <div className="mb-5">
        <FilterPills
          items={["Transaction Log", "Points Analysis"]}
          value="Transaction Log"
          onChange={(v) => v === "Points Analysis" && nav("/sales/points")}
        />
      </div>

      <div className="border-t border-slate-100">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] text-sm text-slate-400 py-4 px-2">
          <div>Receipt No</div><div>Date</div><div>Member</div><div>Total Amount</div><div>Method</div><div></div>
        </div>
        {data.map((r, i) => (
          <div key={i} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] items-center py-4 px-2 border-t border-slate-100 text-sm">
            <div className="font-semibold">{r.no}</div>
            <div>{r.date}</div>
            <div>{r.member}</div>
            <div>{r.amount}</div>
            <div>{r.method}</div>
            <button className="w-9 h-9 rounded-lg bg-rose-100 hover:bg-rose-200 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        ))}
      </div>
      <Pagination />
    </div>
  );
}
