import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, ConfirmModal, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, put } from "../../lib/api";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";

export default function CoachEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [original, setOriginal] = useState(null);
  const [specialities, setSpecialities] = useState([]);
  const [confirm, setConfirm] = useState(false);

  const isDirty = form && original && JSON.stringify(form) !== JSON.stringify(original);
  const { showPrompt, confirmLeave, cancelLeave } = useUnsavedChanges(isDirty);

  useEffect(() => {
    get(`/coaches/${id}`).then((data) => { setForm(data); setOriginal(data); }).catch((e) => toast(e.message, "error"));
    get("/coaches").then((coaches) => {
      const opts = [...new Set(coaches.map((c) => (c.speciality || "").trim()).filter((s) => s && s.length > 1))].sort();
      setSpecialities(opts);
    }).catch(() => {});
  }, [id]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function doSave() {
    try {
      await put(`/coaches/${id}`, {
        name: form.name,
        speciality: form.speciality,
        hourly_rate: form.hourly_rate,
        phone: form.phone,
      });
      toast("Coach updated successfully");
      setOriginal(form);
      nav("/data/coaches");
    } catch (e) { toast(e.message, "error"); }
    setConfirm(false);
  }

  if (!form) return <div className="py-8 text-center text-sm text-slate-400">Loading...</div>;

  const specialityOpts = [...new Set([...specialities, (form.speciality || "").trim()].filter(Boolean))].sort();

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
            <select
              value={form.speciality ?? ""}
              onChange={(e) => set("speciality", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {specialityOpts.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Hourly Rate" required><Input value={form.hourly_rate ?? ""} onChange={(e) => set("hourly_rate", e.target.value)} /></Field>
          <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
        </div>
      </Card>
      <ConfirmModal open={confirm} title="Save Changes?" message="Save updates to this coach?" confirmText="Save" variant="primary" onConfirm={doSave} onCancel={() => setConfirm(false)} />
      <ConfirmModal open={showPrompt} title="Unsaved Changes" message="You have unsaved changes. Leave without saving?" confirmText="Leave" onConfirm={confirmLeave} onCancel={cancelLeave} />
    </div>
  );
}
