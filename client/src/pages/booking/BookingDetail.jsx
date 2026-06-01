import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Printer, XCircle } from "lucide-react";
import { PageTitle, Button, Card, Tooltip, ConfirmModal } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, put, del } from "../../lib/api";

function Info({ label, value }) {
  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className="text-base font-semibold text-slate-900">{value ?? "-"}</div>
    </div>
  );
}
function SummaryRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-base font-bold text-slate-900 ${valueClass}`}>{value ?? "0.00"}</span>
    </div>
  );
}

export default function BookingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [b, setB] = useState(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { get(`/bookings/${id}`).then(setB).catch((e) => toast(e.message, "error")); }, [id]);

  function handleCancel() {
    setConfirm(true);
  }

  async function doCancel() {
    try {
      await del(`/bookings/${id}`);
      toast("Booking cancelled");
      nav("/booking");
    } catch (e) { toast(e.message, "error"); }
    setConfirm(false);
  }

  if (!b) return <div className="py-8 text-center text-sm text-slate-400">Loading...</div>;

  const courts = b.booking_court ?? [];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageTitle back title={b.code}>
          <span className="text-indigo-600 font-medium">{b.status}</span>
        </PageTitle>
        <div className="flex gap-3 no-print">
          <Tooltip text="Edit this booking">
            <Button variant="outlineBlue" icon={Pencil} onClick={() => nav(`/booking/${id}/edit`)}>Edit Booking</Button>
          </Tooltip>
          <Tooltip text="Print receipt">
            <Button variant="outlineBlue" icon={Printer} onClick={() => window.print()}>Print Receipt</Button>
          </Tooltip>
          <Tooltip text="Cancel this booking">
            <Button variant="danger" icon={XCircle} onClick={handleCancel}>Cancel Booking</Button>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Customer Info">
            <div className="grid grid-cols-3 gap-6">
              <Info label="Name"  value={b.member?.name} />
              <Info label="Phone" value={b.member?.phone} />
              <Info label="Tier"  value={b.member?.tier_id} />
            </div>
          </Card>
          <Card title="Booking Info">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Info label="Reservation Code" value={b.code} />
              <Info label="Booking Date"     value={b.booking_date} />
            </div>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Info label="Play Date"   value={b.play_date} />
              <Info label="Time"        value={courts[0] ? `${(courts[0].start_time||"").slice(0,5)} - ${(courts[0].end_time||"").slice(0,5)}` : "-"} />
              <Info label="Total Hours" value={courts[0]?.hours} />
            </div>
            <div className="border-t border-slate-100 pt-5">
              <h4 className="text-base font-bold mb-4">Court Info</h4>
              {courts.map((c, i) => <Info key={i} label="Court No" value={c.court?.court_code ?? c.court_id} />)}
            </div>
          </Card>
        </div>
        <Card title="Payment Summary">
          <SummaryRow label="Subtotal"        value={b.subtotal} />
          <SummaryRow label="Discount"        value={b.discount} />
          <SummaryRow label="Points Redeemed" value={b.points_redeemed} />
          <div className="border-t border-slate-100 my-4" />
          <SummaryRow label="Net Amount Due" value={b.net_amount} />
          <SummaryRow label="Total Deposit"  value={b.deposit} />
          <SummaryRow label="Change"         value={b.change} />
          <div className="border-t border-slate-100 my-4" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+{b.points_earned ?? 0}</span>
          </div>
        </Card>
      </div>

      <ConfirmModal
        open={confirm}
        title="Cancel Booking?"
        message={`Cancel reservation ${b.code}? This action cannot be undone.`}
        confirmText="Yes, Cancel"
        onConfirm={doCancel}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
