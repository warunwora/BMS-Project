import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, ConfirmModal, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, put } from "../../lib/api";

export default function CoachEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { get(`/coaches/${id}`).then(setForm).catch((e) => toast(e.message, "error")); }, [id]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function doSave() {
    try { await put(`/coaches/${id}`, form); toast("Coach updated successfully"); nav("/data/coaches"); }
    catch (e) { toast(e.message, "error"); }
    setConfirm(false);
  }

  if (!form) return <div className="py-8 text-center text-sm text-slate-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title={form.name} />
        <div className="flex gap-3">
          <Button variant="dangerOutline" onClick={() => nav(-1)}>Cancel</Button>
          <Tooltip text="Save changes"><Button icon={Save} onClick={() => setConfirm(true)}>Save</Button></Tooltip>
        </div>
      </div>
      <Card title="Coach Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Name" required><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Speciality" required>
            <Select value={form.speciality ?? "Doubles Strategy"} onChange={(e) => set("speciality", e.target.value)}>
              <option>Doubles Strategy</option><option>Singles</option>
            </Select>
          </Field>
          <Field label="Hourly Rate" required><Input value={form.hourly_rate ?? ""} onChange={(e) => set("hourly_rate", e.target.value)} /></Field>
        </div>
      </Card>
      <ConfirmModal open={confirm} title="Save Changes?" message="Save updates to this coach?" confirmText="Save" variant="primary" onConfirm={doSave} onCancel={() => setConfirm(false)} />
    </div>
  );
}
