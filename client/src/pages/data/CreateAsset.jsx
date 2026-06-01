import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { post } from "../../lib/api";

export default function CreateAsset() {
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ code: "", brand: "", type: "shoes", base_rate: "" });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.code.trim()) { toast("Code is required", "warning"); return; }
    if (!form.brand.trim()) { toast("Brand is required", "warning"); return; }
    if (!form.base_rate.toString().trim()) { toast("Base Rate is required", "warning"); return; }
    try {
      await post("/assets", form);
      toast("Asset created successfully");
      nav("/data/assets");
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title="Create New Assets" />
        <div className="flex gap-3">
          <Button variant="dangerOutline" onClick={() => nav(-1)}>Cancel</Button>
          <Tooltip text="Save new asset"><Button icon={Save} onClick={handleSave}>Save</Button></Tooltip>
        </div>
      </div>

      <Card title="Asset Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Code" required><Input placeholder="R000" value={form.code} onChange={(e) => set("code", e.target.value)} /></Field>
          <Field label="Brand" required><Input placeholder="Brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} /></Field>
          <Field label="Type" required>
            <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option>shoes</option><option>racket</option>
            </Select>
          </Field>
          <Field label="Base Rate" required><Input placeholder="0.00" value={form.base_rate} onChange={(e) => set("base_rate", e.target.value)} /></Field>
        </div>
      </Card>
    </div>
  );
}
