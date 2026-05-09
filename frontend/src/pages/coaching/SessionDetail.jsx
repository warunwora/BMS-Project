import { Pencil, Printer } from "lucide-react";
import { PageTitle, Button, Card } from "../../components/ui";

function Info({ label, value }) {
  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className="text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}

export default function SessionDetail() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageTitle back title="Session CS-001" />
        <div className="flex gap-3">
          <Button variant="outlineBlue" icon={Pencil}>Edit Session</Button>
          <Button variant="outlineBlue" icon={Printer}>Print Receipt</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Customer Info">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Info label="Name" value="New Gersy" />
              <Info label="Phone" value="834567890" />
              <Info label="Tier" value="Premium member" />
            </div>
            <Info label="Booking Date" value="22/03/2026" />
          </Card>

          <Card title="Session Info">
            <div className="grid grid-cols-3 gap-6">
              <Info label="Coach" value="Nattapong Srisawat" />
              <Info label="Speciality" value="Doubles Strategy" />
              <Info label="Skill Focus" value="Beginner Badminton" />
            </div>
          </Card>

          <Card title="Sessions">
            <div className="text-sm text-slate-500 mb-4">Total: 2</div>
            <div className="grid grid-cols-7 text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Training Date</div><div>Start Time</div><div>End Time</div><div>Hours</div><div>Skill Focus</div><div>Rate/Hr</div><div>Extended Fee</div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-7 py-4 border-b border-slate-100 text-sm">
                <div className="font-semibold">25/03/2026</div>
                <div>17:00</div>
                <div>19:00</div>
                <div>2</div>
                <div>Beginner Badminton</div>
                <div>0.00</div>
                <div>0.00</div>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Payment Summary">
          <Row label="Subtotal" value="400.00" />
          <Row label="Member Discount" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Net Coaching Fee" value="400.00" />
          <Row label="Total Deposit" value="0.00" />
          <Row label="Change" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+10</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
