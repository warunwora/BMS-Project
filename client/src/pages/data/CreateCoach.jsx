import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, post } from "../../lib/api";

export default function CreateCoach() {
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", speciality: "", hourly_rate: "", phone: "" });
  const [specialities, setSpecialities] = useState([]);

  useEffect(() => {
    get("/coaches").then((coaches) => {
      const opts = [...new Set(coaches.map((c) => (c.speciality || "").trim()).filter((s) => s && s.length > 1))].sort();
      setSpecialities(opts);
      if (opts.length) setForm((f) => ({ ...f, speciality: opts[0] }));
    }).catch(() => {});
  }, []);

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
            <select
              value={form.speciality}
              onChange={(e) => set("speciality", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {specialities.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Hourly Rate" required><Input placeholder="0.00" value={form.hourly_rate} onChange={(e) => set("hourly_rate", e.target.value)} /></Field>
          <Field label="Phone"><Input placeholder="0812345678" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        </div>
      </Card>
    </div>
  );
}
