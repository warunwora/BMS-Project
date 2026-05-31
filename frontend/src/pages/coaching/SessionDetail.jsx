import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Printer, XCircle } from "lucide-react";
import { PageTitle, Button, Card, Tooltip, ConfirmModal } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

function Info({ label, value }) {
  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className="text-base font-semibold text-slate-900">{value ?? "-"}</div>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-900">{value ?? "0.00"}</span>
    </div>
  );
}

export default function SessionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [s, setS] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => { get(`/sessions/${id}`).then(setS).catch((e) => toast(e.message, "error")); }, [id]);

  async function doCancel() {
    try { await del(`/sessions/${id}`); toast("Session cancelled"); nav("/coaching"); }
    catch (e) { toast(e.message, "error"); }
    setConfirmCancel(false);
  }

  if (!s) return <div className="py-8 text-center text-sm text-slate-400">Loading...</div>;

  const slots = s.coaching_slot ?? [];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageTitle back title={`Session ${s.code}`} />
        <div className="flex gap-3 no-print">
          <Tooltip text="Edit session details">
            <Button variant="outlineBlue" icon={Pencil} onClick={() => nav(`/coaching/${id}/edit`)}>Edit Session</Button>
          </Tooltip>
          <Tooltip text="Print receipt">
            <Button variant="outlineBlue" icon={Printer} onClick={() => window.print()}>Print Receipt</Button>
          </Tooltip>
          <Tooltip text="Cancel this session">
            <Button variant="danger" icon={XCircle} onClick={() => setConfirmCancel(true)}>Cancel Session</Button>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Customer Info">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Info label="Name"  value={s.member?.name} />
              <Info label="Phone" value={s.member?.phone} />
              <Info label="Tier"  value={s.member?.tier_id} />
            </div>
            <Info label="Booking Date" value={s.booking_date} />
          </Card>
          <Card title="Session Info">
            <div className="grid grid-cols-3 gap-6">
              <Info label="Coach"       value={s.coach?.name} />
              <Info label="Speciality"  value={s.coach?.speciality} />
              <Info label="Skill Focus" value={s.skill_focus} />
            </div>
          </Card>
          <Card title="Sessions">
            <div className="text-sm text-slate-500 mb-4">Total: {slots.length}</div>
            <div className="grid grid-cols-7 text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Training Date</div><div>Start</div><div>End</div><div>Hours</div><div>Skill Focus</div><div>Rate/Hr</div><div>Extended Fee</div>
            </div>
            {slots.map((sl, i) => (
              <div key={i} className="grid grid-cols-7 py-4 border-b border-slate-100 text-sm">
                <div className="font-semibold">{sl.training_date}</div>
                <div>{sl.start_time}</div>
                <div>{sl.end_time}</div>
                <div>{sl.hours}</div>
                <div>{sl.skill_focus}</div>
                <div>{sl.rate}</div>
                <div>{sl.extended_fee}</div>
              </div>
            ))}
          </Card>
        </div>
        <Card title="Payment Summary">
          <Row label="Subtotal"        value={s.subtotal} />
          <Row label="Member Discount" value={s.discount} />
          <div className="border-t border-slate-100 my-4" />
          <Row label="Net Coaching Fee" value={s.net_amount} />
          <Row label="Total Deposit"    value={s.deposit} />
          <Row label="Change"           value={s.change} />
          <div className="border-t border-slate-100 my-4" />
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+{s.points_earned ?? 0}</span>
          </div>
        </Card>
      </div>
      <ConfirmModal open={confirmCancel} title="Cancel Session?" message={`Cancel session ${s?.code}? This will delete the record.`} confirmText="Cancel Session" onConfirm={doCancel} onCancel={() => setConfirmCancel(false)} />
    </div>
  );
}
