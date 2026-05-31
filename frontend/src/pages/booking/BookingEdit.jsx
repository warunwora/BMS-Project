import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, ConfirmModal, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, put } from "../../lib/api";

function Info({ label, value }) {
  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className="text-base font-semibold text-slate-900">{value ?? "-"}</div>
    </div>
  );
}

export default function BookingEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { get(`/bookings/${id}`).then(setForm).catch((e) => toast(e.message, "error")); }, [id]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function doSave() {
    try {
      const { member, booking_court, ...fields } = form;
      await put(`/bookings/${id}`, fields);
      toast("Booking updated successfully");
      nav(`/booking/${id}`);
    } catch (e) { toast(e.message, "error"); }
    setConfirm(false);
  }

  if (!form) return <div className="py-8 text-center text-sm text-slate-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title={`Edit ${form.code}`} />
        <div className="flex gap-3">
          <Button variant="dangerOutline" onClick={() => nav(-1)}>Cancel</Button>
          <Tooltip text="Save changes">
            <Button icon={Save} onClick={() => setConfirm(true)}>Save</Button>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card title="Customer Info">
          <div className="grid grid-cols-3 gap-6">
            <Info label="Name"  value={form.member?.name} />
            <Info label="Phone" value={form.member?.phone} />
            <Info label="Tier"  value={form.member?.tier_id} />
          </div>
        </Card>
        <Card title="Booking Info">
          <div className="grid grid-cols-3 gap-6 mb-5">
            <Info label="Reservation Code" value={form.code} />
            <Info label="Booking Date"     value={form.booking_date} />
            <Field label="Play Date" required>
              <input type="date" value={form.play_date ?? ""} onChange={(e) => set("play_date", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            </Field>
          </div>
          <Field label="Status" required>
            <Select value={form.status ?? "Upcoming"} onChange={(e) => set("status", e.target.value)}>
              <option>Upcoming</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
            </Select>
          </Field>
        </Card>
        <Card title="Payment">
          <div className="grid grid-cols-3 gap-6">
            <Field label="Subtotal"><Input value={form.subtotal ?? ""} onChange={(e) => set("subtotal", e.target.value)} /></Field>
            <Field label="Discount"><Input value={form.discount ?? ""} onChange={(e) => set("discount", e.target.value)} /></Field>
            <Field label="Net Amount"><Input value={form.net_amount ?? ""} onChange={(e) => set("net_amount", e.target.value)} /></Field>
            <Field label="Deposit"><Input value={form.deposit ?? ""} onChange={(e) => set("deposit", e.target.value)} /></Field>
            <Field label="Change"><Input value={form.change ?? ""} onChange={(e) => set("change", e.target.value)} /></Field>
          </div>
        </Card>
      </div>

      <ConfirmModal
        open={confirm}
        title="Save Changes?"
        message="Save updates to this booking?"
        confirmText="Save"
        variant="primary"
        onConfirm={doSave}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
