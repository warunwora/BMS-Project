import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { PageTitle, Button, Card, Field, Select, Plus, MemberSearch } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, post } from "../../lib/api";

function Row({ label, value, color = "" }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-base font-bold ${color || "text-slate-900"}`}>{value}</span>
    </div>
  );
}

export default function CreateRental() {
  const nav = useNavigate();
  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [assets, setAssets] = useState([]);
  const [member, setMember] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => { get("/assets").then(setAssets); }, []);


  function addItem() {
    const asset = assets.find((a) => a.id == selectedAsset);
    if (!asset) return;
    setItems((prev) => [...prev, { asset_id: asset.id, asset, condition_out: "Good", rate: asset.base_rate, deposit: "0.00" }]);
  }

  function removeItem(i) { setItems((prev) => prev.filter((_, idx) => idx !== i)); }

  const total = items.reduce((s, i) => s + parseFloat(i.rate || 0), 0);

  async function handleConfirm() {
    const e = {};
    if (!member) e.member = "Member is required";
    if (items.length === 0) e.items = "Add at least one asset";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    try {
      const rental = await post("/rentals", {
        member_id: member?.id,
        date: today,
        status: "Rented",
        total_fee: total.toFixed(2),
        items: items.map(({ asset_id, condition_out, rate, deposit }) => ({ asset_id, condition_out, rate, deposit })),
      });
      toast("Rental created successfully");
      nav(`/rental/${rental.id}`);
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <PageTitle back title="Create New Rental" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Rental Information">
            <Field label="Date"><div className="text-base font-semibold text-slate-900">{today}</div></Field>
            <div className="mt-5">
              <Field label="Member">
                <MemberSearch selected={member} onSelect={(m) => { setMember(m); setErrors((p) => ({ ...p, member: "" })); }} />
                {errors.member && <p className="text-xs text-red-500 mt-1">{errors.member}</p>}
              </Field>
            </div>
          </Card>

          <Card title="Asset Selection" action={
            <div className="flex gap-2 items-center">
              <Select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)}>
                <option value="">Select Asset</option>
                {assets.map((a) => <option key={a.id} value={a.id}>{a.brand} ({a.code})</option>)}
              </Select>
              <Button variant="outlineBlue" icon={Plus} onClick={addItem}>Add Asset</Button>
            </div>
          }>
            {errors.items && <p className="text-xs text-red-500 mb-2">{errors.items}</p>}
            <div className="text-sm text-slate-500 mb-4">Total: {items.length}</div>
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Asset</div><div>Condition Out</div><div>Rental Rate</div><div>Deposit</div><div></div>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] py-4 border-b border-slate-100 text-sm items-center">
                <div className="font-semibold">{item.asset?.brand} {item.asset?.code}</div>
                <div>{item.condition_out}</div>
                <div>{item.rate}</div>
                <input
                  type="number"
                  value={item.deposit}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row, idx) =>
                        idx === i
                          ? { ...row, deposit: e.target.value }
                          : row
                      )
                    )
                  }
                />
                <button onClick={() => removeItem(i)} className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Summary & Payment">
          <Row label="Total Rental Fee" value={total.toFixed(2)} />
          <Row
            label="Total Deposit"
            value={
              items
                .reduce((s, i) => s + parseFloat(i.deposit || 0), 0)
                .toFixed(2)
            }
            color="text-emerald-600"
          />
          <Row label="Member Discount" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Amount to Collect" value={total.toFixed(2)} />
          <div className="flex justify-between items-center py-1 mb-4">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+{Math.floor(total / 10)}</span>
          </div>
          <Button className="w-full mb-3" onClick={handleConfirm}>Confirm Rental</Button>
          <Button variant="dangerOutline" className="w-full" onClick={() => nav(-1)}>Cancel</Button>
        </Card>
      </div>
    </div>
  );
}
