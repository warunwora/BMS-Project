import { Printer, CheckCircle2 } from "lucide-react";
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

export default function WorkOrderDetail() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageTitle back title="WO-001">
          <span className="text-indigo-600 font-medium">Pending</span>
        </PageTitle>
        <div className="flex gap-3">
          <Button variant="outlineBlue" icon={Printer}>Print Ticket</Button>
          <Button icon={CheckCircle2}>Mark as Completed</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Rental Info">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Info label="Name" value="Kim Joung Un" />
              <Info label="Phone" value="834567890" />
              <Info label="Tier" value="Premium member" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Info label="Date" value="22/03/2026" />
              <Info label="Tech ID" value="T-01" />
            </div>
          </Card>

          <Card title="Service Items">
            <div className="text-sm text-slate-500 mb-4">Total: 2</div>
            <div className="grid grid-cols-[1.4fr_0.7fr_1fr_0.7fr_0.8fr_0.8fr_0.8fr] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Model</div><div>Code</div><div>Service</div><div>Tension</div><div>Mat. Cost</div><div>Labor Fee</div><div>Total</div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[1.4fr_0.7fr_1fr_0.7fr_0.8fr_0.8fr_0.8fr] py-4 border-b border-slate-100 text-sm">
                <div className="font-semibold">Yonex BG65 String</div>
                <div>P021</div>
                <div>Stringing</div>
                <div>0</div>
                <div>0.00</div>
                <div>0.00</div>
                <div>0.00</div>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Payment Summary">
          <Row label="Subtotal" value="400.00" />
          <Row label="Total Labor" value="0.00" />
          <Row label="Member Discount" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Net" value="400.00" />
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
