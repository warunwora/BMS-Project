import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, ConfirmModal, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, put } from "../../lib/api";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";

export default function CustomerEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [original, setOriginal] = useState(null);
  const [confirm, setConfirm] = useState(false);

  const isDirty = form && original && JSON.stringify(form) !== JSON.stringify(original);
  const { showPrompt, confirmLeave, cancelLeave } = useUnsavedChanges(isDirty);

  useEffect(() => {
    get(`/members/${id}`).then((data) => { setForm(data); setOriginal(data); }).catch((e) => toast(e.message, "error"));
  }, [id]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function doSave() {
    try { await put(`/members/${id}`, form); toast("Member updated successfully"); setOriginal(form); nav("/data/members"); }
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
      <div className="flex flex-col gap-6">
        <Card title="Customer Info">
          <div className="grid grid-cols-4 gap-6">
            <Field label="Name" required><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Phone" required><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Email"><Input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Gender" required>
              <Select value={form.gender ?? "Male"} onChange={(e) => set("gender", e.target.value)}>
                <option>Male</option><option>Female</option>
              </Select>
            </Field>
          </div>
        </Card>
        <Card title="Membership Info">
          <div className="grid grid-cols-3 gap-6">
            <Field label="Membership Tier" required>
              <Select value={form.tier_id ?? "Bronze"} onChange={(e) => set("tier_id", e.target.value)}>
                <option>Bronze</option><option>Silver</option><option>Gold</option><option>Premium</option>
              </Select>
            </Field>
            <Field label="Current Reward Points"><div className="text-base font-semibold">{form.points ?? 0}</div></Field>
            <Field label="Lifetime Points"><div className="text-base font-semibold">{form.lifetime_points ?? 0}</div></Field>
          </div>
        </Card>
      </div>
      <ConfirmModal open={confirm} title="Save Changes?" message="Save updates to this member?" confirmText="Save" variant="primary" onConfirm={doSave} onCancel={() => setConfirm(false)} />
      <ConfirmModal open={showPrompt} title="Unsaved Changes" message="You have unsaved changes. Leave without saving?" confirmText="Leave" onConfirm={confirmLeave} onCancel={cancelLeave} />
    </div>
  );
}
