import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, Plus, MemberSearch, TechnicianSearch } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, post } from "../../lib/api";

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}

export default function CreateWorkOrder() {
  const nav = useNavigate();
  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [member, setMember] = useState(null);
  const [technician, setTechnician] = useState(null);
  const [estFinish, setEstFinish] = useState("");
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ asset: "", product_code: "", service: "Stringing", tension: "", material_cost: "0.00", labor_fee: "0.00" });
  const [errors, setErrors] = useState({});


  function setItem(k, v) { setNewItem((i) => ({ ...i, [k]: v })); }

  function addItem() {
    setItems((prev) => [...prev, { ...newItem }]);
    setNewItem({ asset: "", product_code: "", service: "Stringing", tension: "", material_cost: "0.00", labor_fee: "0.00" });
  }

  function removeItem(i) { setItems((prev) => prev.filter((_, idx) => idx !== i)); }

  const totalMaterial = items.reduce((s, i) => s + parseFloat(i.material_cost || 0), 0);
  const totalLabor = items.reduce((s, i) => s + parseFloat(i.labor_fee || 0), 0);
  const net = totalMaterial + totalLabor;

  async function handleSave() {
    const e = {};
    if (!member) e.member = "Member is required";
    if (!technician) e.technician = "Technician is required";
    if (!estFinish) e.estFinish = "Estimated finish date is required";
    if (items.length === 0) e.items = "Add at least one service item";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    try {
      const wo = await post("/work-orders", {
        member_id: member?.id,
        tech_id: technician?.id,
        date: today,
        est_finish_date: estFinish,
        status: "Pending",
        subtotal: totalMaterial.toFixed(2),
        total_labor: totalLabor.toFixed(2),
        net_amount: net.toFixed(2),
        items,
      });
      toast("Work order created successfully");
      nav(`/restringing/${wo.id}`);
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <PageTitle back title="Create Work Order" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Order Details">
            <Field label="Date"><div className="text-base font-semibold text-slate-900">{today}</div></Field>
            <div className="mt-5">
              <Field label="Member">
                <MemberSearch selected={member} onSelect={(m) => { setMember(m); setErrors((p) => ({ ...p, member: "" })); }} />
                {errors.member && <p className="text-xs text-red-500 mt-1">{errors.member}</p>}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-5">
              <Field label="Technician" required>
                <TechnicianSearch selected={technician} onSelect={(t) => { setTechnician(t); setErrors((p) => ({ ...p, technician: "" })); }} />
                {errors.technician && <p className="text-xs text-red-500 mt-1">{errors.technician}</p>}
              </Field>
              <Field label="Est Finish Date" required>
                <input type="date" value={estFinish} onChange={(e) => { setEstFinish(e.target.value); setErrors((p) => ({ ...p, estFinish: "" })); }} className={`w-full px-4 py-2.5 border rounded-xl text-sm ${errors.estFinish ? "border-red-400" : "border-slate-200"}`} />
                {errors.estFinish && <p className="text-xs text-red-500 mt-1">{errors.estFinish}</p>}
              </Field>
            </div>
          </Card>

          <Card title="Service Items" action={<Button variant="outlineBlue" icon={Plus} onClick={addItem}>Add Service</Button>}>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Field label="Asset"><Input placeholder="Model" value={newItem.asset} onChange={(e) => setItem("asset", e.target.value)} /></Field>
              <Field label="Code"><Input placeholder="P000" value={newItem.product_code} onChange={(e) => setItem("product_code", e.target.value)} /></Field>
              <Field label="Service">
                <Select value={newItem.service} onChange={(e) => setItem("service", e.target.value)}>
                  <option>Stringing</option><option>Grip</option><option>Repair</option>
                </Select>
              </Field>
              <Field label="Tension"><Input placeholder="0" value={newItem.tension} onChange={(e) => setItem("tension", e.target.value)} /></Field>
              <Field label="Mat. Cost"><Input placeholder="0.00" value={newItem.material_cost} onChange={(e) => setItem("material_cost", e.target.value)} /></Field>
              <Field label="Labor Fee"><Input placeholder="0.00" value={newItem.labor_fee} onChange={(e) => setItem("labor_fee", e.target.value)} /></Field>
            </div>
            {errors.items && <p className="text-xs text-red-500 mb-2">{errors.items}</p>}
            <div className="text-sm text-slate-500 mb-4">Total: {items.length}</div>
            <div className="grid grid-cols-[1.4fr_0.7fr_1fr_0.7fr_0.9fr_0.9fr_0.9fr_auto] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Asset</div><div>Code</div><div>Service</div><div>Tension</div><div>Mat. Cost</div><div>Labor Fee</div><div>Total</div><div></div>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1.4fr_0.7fr_1fr_0.7fr_0.9fr_0.9fr_0.9fr_auto] py-4 border-b border-slate-100 text-sm items-center">
                <div className="font-semibold">{item.asset}</div>
                <div>{item.product_code}</div>
                <div>{item.service}</div>
                <div>{item.tension}</div>
                <div>{item.material_cost}</div>
                <div>{item.labor_fee}</div>
                <div>{(parseFloat(item.material_cost || 0) + parseFloat(item.labor_fee || 0)).toFixed(2)}</div>
                <button onClick={() => removeItem(i)} className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Summary">
          <Row label="Total Material" value={totalMaterial.toFixed(2)} />
          <Row label="Total Labor" value={totalLabor.toFixed(2)} />
          <Row label="Member Discount" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Net" value={net.toFixed(2)} />
          <div className="border-t border-slate-100 my-4"></div>
          <div className="flex justify-between mb-5">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+{Math.floor(net / 10)}</span>
          </div>
          <Button className="w-full mb-3" onClick={handleSave}>Save Work Order</Button>
          <Button variant="dangerOutline" className="w-full" onClick={() => nav(-1)}>Cancel</Button>
        </Card>
      </div>
    </div>
  );
}
