import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { post } from "../../lib/api";

export default function CreateProduct() {
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ code: "", name: "", category: "instrument", unit_price: "", stock: 0 });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.code.trim()) { toast("Code is required", "warning"); return; }
    if (!form.name.trim()) { toast("Name is required", "warning"); return; }
    if (!form.unit_price.toString().trim()) { toast("Unit Price is required", "warning"); return; }
    try {
      await post("/products", form);
      toast("Product created successfully");
      nav("/data/products");
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title="Create New Product" />
        <div className="flex gap-3">
          <Button variant="dangerOutline" onClick={() => nav(-1)}>Cancel</Button>
          <Tooltip text="Save new product"><Button icon={Save} onClick={handleSave}>Save</Button></Tooltip>
        </div>
      </div>

      <Card title="Product Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Code" required><Input placeholder="P000" value={form.code} onChange={(e) => set("code", e.target.value)} /></Field>
          <Field label="Name" required><Input placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Category" required>
            <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option>instrument</option><option>beverage</option>
            </Select>
          </Field>
          <Field label="Unit Price" required><Input placeholder="0.00" value={form.unit_price} onChange={(e) => set("unit_price", e.target.value)} /></Field>
          <Field label="Stock"><Input placeholder="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} /></Field>
        </div>
      </Card>
    </div>
  );
}
