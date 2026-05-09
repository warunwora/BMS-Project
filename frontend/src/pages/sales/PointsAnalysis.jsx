import { useNavigate } from "react-router-dom";
import { Send, Calendar, Receipt, Gift } from "lucide-react";
import { PageHeader, Button, FilterPills, Card } from "../../components/ui";

const months = [
  { m: "Jun 2025", v: 16 },
  { m: "Jul 2025", v: 30 },
  { m: "Aug 2025", v: 15 },
  { m: "Sep 2025", v: 30 },
  { m: "Oct 2025", v: 20 },
  { m: "Nov 2025", v: 32 },
  { m: "Dec 2025", v: 19 },
  { m: "Jan 2026", v: 30 },
  { m: "Feb 2026", v: 20 },
  { m: "Mar 2026", v: 40 },
];

export default function PointsAnalysis() {
  const nav = useNavigate();
  const max = 40;
  return (
    <div>
      <PageHeader title="Sales History" actions={<Button variant="outlineBlue" icon={Send}>Export as</Button>} />
      <div className="mb-5">
        <FilterPills
          items={["Transaction Log", "Points Analysis"]}
          value="Points Analysis"
          onChange={(v) => v === "Transaction Log" && nav("/sales")}
        />
      </div>

      <Card>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Number of Points Redeemed Analysis</h3>
            <div className="text-xs text-slate-400">Updated: 22/03/2026 14:30</div>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
              <Calendar className="w-4 h-4" /> Jun 2025 - Mar 2026
            </button>
            <button className="inline-flex items-center justify-between gap-3 px-4 py-2.5 border border-slate-200 rounded-xl text-sm min-w-[220px]">
              Number of Points Redeemed
            </button>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-3 items-end h-64 mb-2">
          {months.map((m) => (
            <div key={m.m} className="flex flex-col items-center justify-end gap-2">
              <div className="text-sm font-semibold">{m.v}</div>
              <div
                className="w-full bg-indigo-500 rounded-t-lg"
                style={{ height: `${(m.v / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-10 gap-3 text-xs text-slate-500 text-center">
          {months.map((m) => <div key={m.m}>{m.m}</div>)}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="border border-slate-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Total Bills with Redemptions</div>
              <div className="text-2xl font-bold">252</div>
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Gift className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Total Points Redeemed</div>
              <div className="text-2xl font-bold">2,423</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
