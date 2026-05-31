import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, ConfirmModal, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, put } from "../../lib/api";

export default function CourtEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { get(`/courts/${id}`).then(setForm).catch((e) => toast(e.message, "error")); }, [id]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function doSave() {
    try { await put(`/courts/${id}`, form); toast("Court updated successfully"); nav("/data/courts"); }
    catch (e) { toast(e.message, "error"); }
    setConfirm(false);
  }

  if (!form) return <div className="py-8 text-center text-sm text-slate-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title={form.court_code} />
        <div className="flex gap-3">
          <Button variant="dangerOutline" onClick={() => nav(-1)}>Cancel</Button>
          <Tooltip text="Save changes"><Button icon={Save} onClick={() => setConfirm(true)}>Save</Button></Tooltip>
        </div>
      </div>
      <Card title="Court Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Court No" required><Input value={form.court_no ?? ""} onChange={(e) => set("court_no", e.target.value)} /></Field>
          <Field label="Court Code" required><Input value={form.court_code ?? ""} onChange={(e) => set("court_code", e.target.value)} /></Field>
          <Field label="Weekday Price" required><Input value={form.weekday_price ?? ""} onChange={(e) => set("weekday_price", e.target.value)} /></Field>
          <Field label="Weekend Price" required><Input value={form.weekend_price ?? ""} onChange={(e) => set("weekend_price", e.target.value)} /></Field>
        </div>
      </Card>
      <ConfirmModal open={confirm} title="Save Changes?" message="Save updates to this court?" confirmText="Save" variant="primary" onConfirm={doSave} onCancel={() => setConfirm(false)} />
    </div>
  );
}
