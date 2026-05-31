import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, Undo2, ChevronDown, XCircle } from "lucide-react";
import { PageTitle, Button, Card, Tooltip, ConfirmModal } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, put, del } from "../../lib/api";

function Info({ label, value, valueClass = "" }) {
  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className={`text-base font-semibold text-slate-900 ${valueClass}`}>{value ?? "-"}</div>
    </div>
  );
}
function Row({ label, value, color = "" }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-base font-bold ${color || "text-slate-900"}`}>{value ?? "0.00"}</span>
    </div>
  );
}

const CONDITIONS = ["Good", "Fair", "Damaged"];
const PENALTIES  = ["None", "Minor", "Major"];

export default function RentalDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [r, setR] = useState(null);
  const [itemUpdates, setItemUpdates] = useState({});
  const [confirm, setConfirm] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => { get(`/rentals/${id}`).then(setR).catch((e) => toast(e.message, "error")); }, [id]);

  function setItemField(i, key, val) {
    setItemUpdates((prev) => ({ ...prev, [i]: { ...(prev[i] || {}), [key]: val } }));
  }

  async function doCancel() {
    try {
      await del(`/rentals/${id}`);
      toast("Rental cancelled");
      nav("/rental");
    } catch (e) { toast(e.message, "error"); }
    setConfirmCancel(false);
  }

  async function doReturn() {
    try {
      await put(`/rentals/${id}`, { status: "Returned" });
      toast("Rental marked as returned");
      nav("/rental");
    } catch (e) { toast(e.message, "error"); }
    setConfirm(false);
  }

  if (!r) return <div className="py-8 text-center text-sm text-slate-400">Loading...</div>;

  const items = r.rental_item ?? [];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageTitle back title={r.code}>
          <span className="text-indigo-600 font-medium">{r.status}</span>
        </PageTitle>
        <div className="flex gap-3 no-print">
          <Tooltip text="Print receipt"><Button variant="outlineBlue" icon={Printer} onClick={() => window.print()}>Print Receipt</Button></Tooltip>
          <Tooltip text="Cancel this rental"><Button variant="danger" icon={XCircle} onClick={() => setConfirmCancel(true)}>Cancel Rental</Button></Tooltip>
          <Tooltip text="Process equipment return"><Button icon={Undo2} onClick={() => setConfirm(true)}>Process Return</Button></Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Rental Info">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Info label="Name"  value={r.member?.name} />
              <Info label="Phone" value={r.member?.phone} />
              <Info label="Tier"  value={r.member?.tier_id} />
            </div>
            <Info label="Date" value={r.date} />
          </Card>
          <Card title="Asset Items">
            <div className="text-sm text-slate-500 mb-4">Total: {items.length}</div>
            <div className="grid grid-cols-[1.4fr_1fr_1.2fr_0.8fr_1fr_1fr] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Asset</div><div>Condition Out</div><div>Condition In</div><div>Rate</div><div>Deposit</div><div>Penalty</div>
            </div>
            {items.map((item, i) => {
              const upd = itemUpdates[i] || {};
              return (
                <div key={i} className="grid grid-cols-[1.4fr_1fr_1.2fr_0.8fr_1fr_1fr] py-4 border-b border-slate-100 text-sm items-center">
                  <div className="font-semibold">{item.asset?.brand} {item.asset?.code}</div>
                  <div className="text-emerald-600">{item.condition_out}</div>
                  <div className="relative">
                    <select value={upd.condition_in ?? item.condition_in ?? ""} onChange={(e) => setItemField(i, "condition_in", e.target.value)} className="appearance-none border border-slate-200 rounded-lg px-3 py-1.5 pr-7 text-sm bg-white w-full cursor-pointer">
                      <option value="">Select</option>
                      {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                  <div>{item.rate}</div>
                  <div className="text-emerald-600">{item.deposit}</div>
                  <div className="relative">
                    <select value={upd.penalty ?? item.penalty ?? ""} onChange={(e) => setItemField(i, "penalty", e.target.value)} className="appearance-none border border-slate-200 rounded-lg px-3 py-1.5 pr-7 text-sm bg-white w-full cursor-pointer">
                      <option value="">None</option>
                      {PENALTIES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
        <Card title="Payment Summary">
          <Row label="Subtotal"        value={r.subtotal} />
          <Row label="Deposit"         value={r.total_deposit} color="text-emerald-600" />
          <Row label="Discount"        value={r.discount} />
          <div className="border-t border-slate-100 my-4" />
          <Row label="Amount Collected" value={r.total_fee} />
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+{r.points_earned ?? 0}</span>
          </div>
          <div className="border-t border-slate-100 my-4" />
          <Row label="Net Refund"    value={r.net_refund} />
          <Row label="Total Deposit" value={r.total_deposit} />
          <Row label="Change"        value={r.change} />
        </Card>
      </div>

      <ConfirmModal open={confirm} title="Process Return?" message="Mark this rental as returned?" confirmText="Confirm Return" variant="primary" onConfirm={doReturn} onCancel={() => setConfirm(false)} />
      <ConfirmModal open={confirmCancel} title="Cancel Rental?" message={`Cancel rental ${r?.code}? This will delete the record.`} confirmText="Cancel Rental" onConfirm={doCancel} onCancel={() => setConfirmCancel(false)} />
    </div>
  );
}
