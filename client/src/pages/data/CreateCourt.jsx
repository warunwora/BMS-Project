import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { post } from "../../lib/api";

export default function CreateCourt() {
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ court_no: "", court_code: "", weekday_price: "", weekend_price: "" });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.court_no.toString().trim()) { toast("Court No is required", "warning"); return; }
    if (!form.court_code.trim()) { toast("Court Code is required", "warning"); return; }
    if (!form.weekday_price.toString().trim()) { toast("Weekday Price is required", "warning"); return; }
    try {
      await post("/courts", form);
      toast("Court created successfully");
      nav("/data/courts");
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title="Create New Courts" />
        <div className="flex gap-3">
          <Button variant="dangerOutline" onClick={() => nav(-1)}>Cancel</Button>
          <Tooltip text="Save new court"><Button icon={Save} onClick={handleSave}>Save</Button></Tooltip>
        </div>
      </div>

      <Card title="Court Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Court No" required><Input placeholder="Court No" value={form.court_no} onChange={(e) => set("court_no", e.target.value)} /></Field>
          <Field label="Court Code" required><Input placeholder="C000" value={form.court_code} onChange={(e) => set("court_code", e.target.value)} /></Field>
          <Field label="Weekday Price" required><Input placeholder="0.00" value={form.weekday_price} onChange={(e) => set("weekday_price", e.target.value)} /></Field>
          <Field label="Weekend Price" required><Input placeholder="0.00" value={form.weekend_price} onChange={(e) => set("weekend_price", e.target.value)} /></Field>
        </div>
      </Card>
    </div>
  );
}
