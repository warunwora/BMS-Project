import { Pencil, Printer, XCircle } from "lucide-react";
import { PageTitle, Button, Card } from "../../components/ui";

function Info({ label, value }) {
  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className="text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-base font-bold text-slate-900 ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function BookingDetail() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageTitle back title="RV20260322-01">
          <span className="text-indigo-600 font-medium">Upcoming</span>
        </PageTitle>
        <div className="flex gap-3">
          <Button variant="outlineBlue" icon={Pencil}>Edit Booking</Button>
          <Button variant="outlineBlue" icon={Printer} onClick={() => window.print()}>Print Receipt</Button>
          <Button variant="danger" icon={XCircle}>Cancel Booking</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Customer Info">
            <div className="grid grid-cols-3 gap-6">
              <Info label="Name" value="Kim Joung Un" />
              <Info label="Phone" value="834567890" />
              <Info label="Tier" value="Premium member" />
            </div>
          </Card>

          <Card title="Booking Info">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Info label="Reservation Code" value="RV20260310-03" />
              <Info label="Booking Date" value="20/03/2026" />
            </div>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Info label="Play Date" value="22/03/2026" />
              <Info label="Time" value="18:00 - 20:00" />
              <Info label="Total Hours" value="2" />
            </div>
            <div className="border-t border-slate-100 pt-5">
              <h4 className="text-base font-bold mb-4">Court Info</h4>
              <Info label="Court No" value="C001" />
            </div>
          </Card>
        </div>

        <Card title="Payment Summary">
          <SummaryRow label="Subtotal" value="400.00" />
          <SummaryRow label="Discount" value="0.00" />
          <SummaryRow label="Points Redeemed" value="0" />
          <div className="border-t border-slate-100 my-4"></div>
          <SummaryRow label="Net Amount Due" value="400.00" />
          <SummaryRow label="Total Deposit" value="0.00" />
          <SummaryRow label="Change" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+10</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
