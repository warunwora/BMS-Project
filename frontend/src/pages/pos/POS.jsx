import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Trash2 } from "lucide-react";
import { PageHeader, Button, Card, Field, Input, Select, Plus, Tooltip, MemberSearch } from "../../components/ui";
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

export default function POS() {
  const nav = useNavigate();
  const toast = useToast();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB") + " " + now.toTimeString().slice(0, 5);
  const [products, setProducts] = useState([]);
  const [member, setMember] = useState(null);
  const [method, setMethod] = useState("Cash");
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [pointsRedeem, setPointsRedeem] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => { get("/products").then(setProducts).catch((e) => toast(e.message, "error")); }, []);


  function addItem() {
    const product = products.find((p) => p.id == selectedProduct);
    if (!product) { toast("Select a product first", "warning"); return; }
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) return prev.map((i) => i.product_id === product.id ? { ...i, qty: i.qty + 1, ext_price: ((i.qty + 1) * parseFloat(i.unit_price)).toFixed(2) } : i);
      return [...prev, { product_id: product.id, product, unit_price: product.unit_price, qty: 1, ext_price: product.unit_price }];
    });
  }

  function removeItem(i) { setItems((prev) => prev.filter((_, idx) => idx !== i)); }

  const subtotal = items.reduce((s, i) => s + parseFloat(i.ext_price || 0), 0);
  const discount = Math.min(pointsRedeem * 0.1, subtotal);
  const net = Math.max(subtotal - discount, 0);

  async function handleConfirm() {
    if (items.length === 0) { setErrors({ items: "Add at least one product" }); return; }
    setErrors({});
    try {
      const receipt = await post("/receipts", {
        member_id: member?.id,
        date: now.toISOString(),
        method,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        points_redeemed: pointsRedeem,
        net_amount: net.toFixed(2),
        points_earned: Math.floor(net / 10),
        items: items.map(({ product_id, unit_price, qty, ext_price }) => ({ product_id, unit_price, qty, ext_price })),
      });
      toast("Sale completed successfully");
      nav(`/pos/receipt/${receipt.id}`);
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <PageHeader
        title="Point of Sale"
        actions={
          <Tooltip text="Print receipt">
            <Button variant="outlineBlue" icon={Printer} onClick={() => window.print()}>Print Receipt</Button>
          </Tooltip>
        }
      />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Receipt Info">
            <div className="grid grid-cols-2 gap-6 mb-5">
              <Field label="Date"><div className="text-base font-semibold">{dateStr}</div></Field>
            </div>
            <Field label="Member">
              <MemberSearch selected={member} onSelect={setMember} />
              {member && <div className="text-xs text-indigo-500 mt-1">Points available: {member.points ?? 0}</div>}
            </Field>
            <div className="mt-5">
              <Field label="Method" required>
                <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option>Cash</option><option>Card</option><option>QR</option>
                </Select>
              </Field>
            </div>
          </Card>

          <Card title="Purchased Items">
            <div className="flex gap-3 mb-5">
              <div className="flex-1">
                <Select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                  <option value="">Select Product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.code} (฿{p.unit_price ?? p.price})</option>)}
                </Select>
              </div>
              <Tooltip text="Add product to cart">
                <Button variant="outlineBlue" icon={Plus} onClick={addItem}>Add Item</Button>
              </Tooltip>
            </div>
            {errors.items && <p className="text-xs text-red-500 mb-2">{errors.items}</p>}
            <div className="text-sm text-slate-500 mb-4">Total: {items.length}</div>
            <div className="grid grid-cols-[0.7fr_1fr_1fr_0.8fr_0.5fr_0.8fr_auto] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Code</div><div>Name</div><div>Category</div><div>Unit Price</div><div>Qty</div><div>Ext. Price</div><div></div>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[0.7fr_1fr_1fr_0.8fr_0.5fr_0.8fr_auto] py-4 border-b border-slate-100 text-sm items-center animate-fade-in">
                <div className="font-semibold">{item.product?.code}</div>
                <div>{item.product?.name}</div>
                <div>{item.product?.category}</div>
                <div>{item.unit_price}</div>
                <div>{item.qty}</div>
                <div>{item.ext_price}</div>
                <button onClick={() => removeItem(i)} className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center hover:bg-rose-200 transition-all active:scale-90"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Summary & Payment">
          <Row label="Subtotal" value={subtotal.toFixed(2)} />
          <Row label="Discount" value={discount.toFixed(2)} />
          <Field label="Points to Redeem">
            <Input type="number" min={0} max={member?.points ?? 0} value={pointsRedeem} onChange={(e) => setPointsRedeem(Number(e.target.value))} />
          </Field>
          <div className="text-xs text-slate-500 mt-2 mb-4">Current: {member?.points ?? 0}</div>
          <div className="border-t border-slate-100 my-4" />
          <Row label="Net Amount Due" value={net.toFixed(2)} />
          <div className="border-t border-slate-100 my-4" />
          <div className="flex justify-between mb-5">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+{Math.floor(net / 10)}</span>
          </div>
          <Tooltip text="Complete and save this sale">
            <Button className="w-full mb-3" onClick={handleConfirm}>Confirm</Button>
          </Tooltip>
          <Button variant="dangerOutline" className="w-full" onClick={() => setItems([])}>Cancel</Button>
        </Card>
      </div>
    </div>
  );
}
