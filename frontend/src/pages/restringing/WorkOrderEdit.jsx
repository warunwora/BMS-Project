import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, Plus, MemberSearch, TechnicianSearch, ProductSearch } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, put } from "../../lib/api";
import { calculateDiscount, calculatePoints } from "../../lib/tierCalculations";

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}

export default function WorkOrderEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [member, setMember] = useState(null);
  const [technician, setTechnician] = useState(null);
  const [estFinish, setEstFinish] = useState("");
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [errors, setErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wo, setWo] = useState(null);

  // Load work order data
  useEffect(() => {
    Promise.all([
      get(`/work-orders/${id}`),
      get("/service-types")
    ])
      .then(([workOrder, serviceTypes]) => {
        setWo(workOrder);
        setServices(serviceTypes);
        setMember(workOrder.member || null);
        setTechnician(workOrder.technician || null);
        setEstFinish(workOrder.est_finish_date || "");
        
        // Load items
        const loadedItems = (workOrder.work_order_item || []).map((item) => ({
          racket_model_product_id: item.racket_model_product_id,
          racket_name: item.racket_name || "",
          racket_code: item.racket_code || "",
          product_id: item.product_id,
          product_name: item.product_name || "",
          product_code: item.product_code || "",
          service_id: item.service_id,
          service_name: item.service_name || "",
          tension: item.tension || 0,
          material_cost: String(item.material_cost || "0.00"),
          labor_fee: String(item.labor_fee || "0.00"),
        }));
        setItems(loadedItems);
        setLoading(false);
      })
      .catch((e) => {
        toast(e.message, "error");
        setLoading(false);
      });
  }, [id]);

  // Calculate discount and points when items or member changes
  useEffect(() => {
    async function updateCalculations() {
      const total = items.reduce((s, i) => s + parseFloat(i.material_cost || 0) + parseFloat(i.labor_fee || 0), 0);
      if (!total || !member?.id) {
        setDiscount(0);
        setPointsEarned(0);
        return;
      }
      try {
        const disc = await calculateDiscount(total, member.tier_id);
        const net = total - disc;
        const pts = await calculatePoints(net, member.tier_id);
        setDiscount(disc);
        setPointsEarned(pts);
      } catch (e) {
        toast(e.message, "error");
      }
    }
    updateCalculations();
  }, [items, member]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        racket_model_product_id: null,
        racket_name: "",
        racket_code: "",
        product_id: null,
        product_name: "",
        product_code: "",
        service_id: null,
        service_name: "",
        tension: "",
        material_cost: "0.00",
        labor_fee: "0.00",
      },
    ]);
    setEditingIndex(items.length);
  }

  function updateItem(index, updates) {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  }

  function saveEdit() {
    setEditingIndex(null);
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
      await put(`/work-orders/${id}`, {
        member_id: member?.id,
        tech_id: technician?.id,
        est_finish_date: estFinish,
        subtotal: totalMaterial.toFixed(2),
        total_labor: totalLabor.toFixed(2),
        discount: discount.toFixed(2),
        net_amount: (net - discount).toFixed(2),
        points_earned: pointsEarned,
        items: items.map((i) => ({
          racket_model_product_id: i.racket_model_product_id,
          product_id: i.product_id,
          service_id: i.service_id,
          tension: i.tension,
          material_cost: i.material_cost,
          labor_fee: i.labor_fee,
        })),
      });
      toast("Work order updated successfully");
      nav(`/restringing/${id}`);
    } catch (e) { toast(e.message, "error"); }
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-slate-400">Loading...</div>;
  }

  return (
    <div>
      <PageTitle back title={`Edit Work Order ${wo?.code}`} />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Order Details">
            <Field label="Date"><div className="text-base font-semibold text-slate-900">{wo?.date}</div></Field>
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
            {errors.items && <p className="text-xs text-red-500 mb-2">{errors.items}</p>}
            <div className="text-sm text-slate-500 mb-4">Total: {items.length}</div>

            {/* Table header */}
            <div className="grid grid-cols-[1.3fr_1.3fr_0.8fr_0.5fr_0.7fr_0.7fr_0.7fr_auto] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Racket Model</div><div>Product</div><div>Service</div><div>Tension</div><div>Mat. Cost</div><div>Labor Fee</div><div>Total</div><div></div>
            </div>

            {/* Table rows */}
            {items.map((item, i) => (
              <div key={i}>
                {editingIndex === i ? (
                  // Edit mode
                  <div className="py-4 border-b border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Racket Model">
                        <ProductSearch
                          selected={item.racket_model_product_id ? { id: item.racket_model_product_id, name: item.racket_name, code: item.racket_code } : null}
                          onSelect={(racket) => updateItem(i, { racket_model_product_id: racket?.id ?? null, racket_name: racket?.name ?? "", racket_code: racket?.code ?? "" })}
                          placeholder="Search racket model..."
                          category="racket"
                        />
                      </Field>
                      <Field label="String / Material Product">
                        <ProductSearch
                          selected={item.product_id ? { id: item.product_id, name: item.product_name, code: item.product_code } : null}
                          onSelect={(product) => updateItem(i, { product_id: product?.id ?? null, product_name: product?.name ?? "", product_code: product?.code ?? "", material_cost: product?.unit_price ? String(product.unit_price) : item.material_cost })}
                          placeholder="Search string or product..."
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <Field label="Service Type">
                        <Select value={item.service_id || ""} onChange={(e) => {
                          const svc = services.find((s) => String(s.id) === e.target.value);
                          updateItem(i, { service_id: e.target.value ? parseInt(e.target.value) : null, service_name: svc?.name ?? "" });
                        }}>
                          <option value="">Select service</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Tension">
                        <Input placeholder="0" value={item.tension} onChange={(e) => updateItem(i, { tension: e.target.value })} />
                      </Field>
                      <Field label="Material Cost">
                        <Input placeholder="0.00" value={item.material_cost} onChange={(e) => updateItem(i, { material_cost: e.target.value })} />
                      </Field>
                      <Field label="Labor Fee">
                        <Input placeholder="0.00" value={item.labor_fee} onChange={(e) => updateItem(i, { labor_fee: e.target.value })} />
                      </Field>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={saveEdit}>Done</Button>
                      <Button variant="dangerOutline" onClick={() => removeItem(i)}>Delete</Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="grid grid-cols-[1.3fr_1.3fr_0.8fr_0.5fr_0.7fr_0.7fr_0.7fr_auto] py-4 border-b border-slate-100 text-sm items-center">
                    <div>
                      <div className="font-semibold">{item.racket_name || "-"}</div>
                      <div className="text-xs text-slate-400">{item.racket_code}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{item.product_name || "-"}</div>
                      <div className="text-xs text-slate-400">{item.product_code}</div>
                    </div>
                    <div>{item.service_name || "-"}</div>
                    <div>{item.tension || "-"}</div>
                    <div>{item.material_cost}</div>
                    <div>{item.labor_fee}</div>
                    <div>{(parseFloat(item.material_cost || 0) + parseFloat(item.labor_fee || 0)).toFixed(2)}</div>
                    <button onClick={() => setEditingIndex(i)} className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center"><Pencil className="w-3.5 h-3.5 text-indigo-600" /></button>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>

        <Card title="Summary">
          <Row label="Total Material" value={totalMaterial.toFixed(2)} />
          <Row label="Total Labor" value={totalLabor.toFixed(2)} />
          <Row label="Member Discount" value={discount.toFixed(2)} />
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Net" value={(net - discount).toFixed(2)} />
          <div className="border-t border-slate-100 my-4"></div>
          <div className="flex justify-between mb-5">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+{pointsEarned}</span>
          </div>
          <Button className="w-full mb-3" onClick={handleSave}>Update Work Order</Button>
          <Button variant="dangerOutline" className="w-full" onClick={() => nav(-1)}>Cancel</Button>
        </Card>
      </div>
    </div>
  );
}
