import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, ConfirmModal, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, put } from "../../lib/api";

export default function AssetEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { get(`/assets/${id}`).then(setForm).catch((e) => toast(e.message, "error")); }, [id]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function doSave() {
    try { await put(`/assets/${id}`, form); toast("Asset updated successfully"); nav("/data/assets"); }
    catch (e) { toast(e.message, "error"); }
    setConfirm(false);
  }

  if (!form) return <div className="py-8 text-center text-sm text-slate-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title={form.code} />
        <div className="flex gap-3">
          <Button variant="dangerOutline" onClick={() => nav(-1)}>Cancel</Button>
          <Tooltip text="Save changes"><Button icon={Save} onClick={() => setConfirm(true)}>Save</Button></Tooltip>
        </div>
      </div>
      <Card title="Asset Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Code" required><Input value={form.code ?? ""} onChange={(e) => set("code", e.target.value)} /></Field>
          <Field label="Brand" required><Input value={form.brand ?? ""} onChange={(e) => set("brand", e.target.value)} /></Field>
          <Field label="Type" required>
            <Select value={form.type ?? "shoes"} onChange={(e) => set("type", e.target.value)}>
              <option>shoes</option><option>racket</option>
            </Select>
          </Field>
          <Field label="Base Rate" required><Input value={form.base_rate ?? ""} onChange={(e) => set("base_rate", e.target.value)} /></Field>
        </div>
      </Card>
      <ConfirmModal open={confirm} title="Save Changes?" message="Save updates to this asset?" confirmText="Save" variant="primary" onConfirm={doSave} onCancel={() => setConfirm(false)} />
    </div>
  );
}
