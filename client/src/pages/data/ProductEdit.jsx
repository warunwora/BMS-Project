import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, ConfirmModal, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, put } from "../../lib/api";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";

export default function ProductEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [original, setOriginal] = useState(null);
  const [confirm, setConfirm] = useState(false);

  const isDirty = form && original && JSON.stringify(form) !== JSON.stringify(original);
  const { showPrompt, confirmLeave, cancelLeave } = useUnsavedChanges(isDirty);

  useEffect(() => { get(`/products/${id}`).then((data) => { setForm(data); setOriginal(data); }).catch((e) => toast(e.message, "error")); }, [id]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function doSave() {
    try { await put(`/products/${id}`, form); toast("Product updated successfully"); setOriginal(form); nav("/data/products"); }
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
      <Card title="Product Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Code" required><Input value={form.code ?? ""} onChange={(e) => set("code", e.target.value)} /></Field>
          <Field label="Name" required><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Category" required>
            <Select value={form.category ?? "instrument"} onChange={(e) => set("category", e.target.value)}>
              <option>instrument</option><option>beverage</option>
            </Select>
          </Field>
          <Field label="Unit Price" required><Input value={form.unit_price ?? ""} onChange={(e) => set("unit_price", e.target.value)} /></Field>
          <Field label="Stock"><Input value={form.stock ?? 0} onChange={(e) => set("stock", e.target.value)} /></Field>
        </div>
      </Card>
      <ConfirmModal open={confirm} title="Save Changes?" message="Save updates to this product?" confirmText="Save" variant="primary" onConfirm={doSave} onCancel={() => setConfirm(false)} />
      <ConfirmModal open={showPrompt} title="Unsaved Changes" message="You have unsaved changes. Leave without saving?" confirmText="Leave" onConfirm={confirmLeave} onCancel={cancelLeave} />
    </div>
  );
}
