import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { post } from "../../lib/api";

export default function CreateCoach() {
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", speciality: "Doubles Strategy", hourly_rate: "" });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.name.trim()) { toast("Name is required", "warning"); return; }
    if (!form.hourly_rate.toString().trim()) { toast("Hourly Rate is required", "warning"); return; }
    try {
      await post("/coaches", form);
      toast("Coach created successfully");
      nav("/data/coaches");
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title="Create New Coach" />
        <div className="flex gap-3">
          <Button variant="dangerOutline" onClick={() => nav(-1)}>Cancel</Button>
          <Tooltip text="Save new coach"><Button icon={Save} onClick={handleSave}>Save</Button></Tooltip>
        </div>
      </div>

      <Card title="Coach Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Name" required><Input placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Speciality" required>
            <Select value={form.speciality} onChange={(e) => set("speciality", e.target.value)}>
              <option>Doubles Strategy</option><option>Singles</option>
            </Select>
          </Field>
          <Field label="Hourly Rate" required><Input placeholder="0.00" value={form.hourly_rate} onChange={(e) => set("hourly_rate", e.target.value)} /></Field>
        </div>
      </Card>
    </div>
  );
}
