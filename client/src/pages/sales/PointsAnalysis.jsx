import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Gift, FileText, BarChart2 } from "lucide-react";
import { PageHeader, Button, FilterPills, Card, ExportDropdown, Tooltip } from "../../components/ui";
import { get } from "../../lib/api";

export default function PointsAnalysis() {
  const nav = useNavigate();
  const [data, setData] = useState([]);
  const [rawData, setRawData] = useState([]);

  const [stats, setStats] = useState({ total_transactions: 0, total_points_redeemed: 0, bills_with_redemptions: 0 });

  useEffect(() => {
    get("/sales/points").then((res) => {
      setRawData(res.monthly ?? []);
      setData((res.monthly ?? []).map((r) => ({ m: r.month, v: r.count })));
      setStats({ total_transactions: res.total_transactions, total_points_redeemed: res.total_points_redeemed, bills_with_redemptions: res.bills_with_redemptions });
    });
  }, []);

  const max = Math.max(...data.map((d) => d.v), 1);
  const totalRedeemed = stats.total_points_redeemed;
  const totalBillsWithRedemptions = stats.total_transactions;

  return (
    <div>
      <PageHeader
        title="Sales History"
        actions={<ExportDropdown data={rawData} filename="points-analysis" />}
      />
      <div className="mb-5">
        <FilterPills
          items={["Transaction Log", "Points Analysis"]}
          value="Points Analysis"
          onChange={(v) => v === "Transaction Log" && nav("/sales")}
          icons={{ "Transaction Log": FileText, "Points Analysis": BarChart2 }}
        />
      </div>

      <Card>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Number of Points Redeemed Analysis</h3>
            <div className="text-xs text-slate-400">Live data from Supabase</div>
          </div>
        </div>

        {data.length > 0 ? (
          <>
            <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)`, alignItems: "end", height: "200px" }}>
              {data.map((d, i) => (
                <div key={d.m} className="flex flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
                  <div className="text-xs font-semibold">{d.v}</div>
                  <div
                    className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-t-lg cursor-default transition-colors"
                    style={{ height: `${Math.max((d.v / max) * 160, d.v > 0 ? 4 : 0)}px` }}
                    title={`${d.m}: ${d.v}`}
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-3 text-xs text-slate-500 text-center" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
              {data.map((d) => <div key={d.m}>{d.m}</div>)}
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-sm text-slate-400">No data yet</div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="border border-slate-200 rounded-xl p-5 flex items-center gap-4 hover:border-indigo-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Total Transactions</div>
              <div className="text-2xl font-bold animate-fade-in">{totalBillsWithRedemptions.toLocaleString()}</div>
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-5 flex items-center gap-4 hover:border-indigo-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Gift className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Total Points Redeemed</div>
              <div className="text-2xl font-bold animate-fade-in">{totalRedeemed.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
