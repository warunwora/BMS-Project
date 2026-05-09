import { Printer, Undo2, ChevronDown } from "lucide-react";
import { PageTitle, Button, Card } from "../../components/ui";

function Info({ label, value, valueClass = "" }) {
  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className={`text-base font-semibold text-slate-900 ${valueClass}`}>{value}</div>
    </div>
  );
}

function Row({ label, value, color = "" }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-base font-bold ${color || "text-slate-900"}`}>{value}</span>
    </div>
  );
}

export default function RentalDetail() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageTitle back title="RI20260205-01">
          <span className="text-indigo-600 font-medium">Rented</span>
        </PageTitle>
        <div className="flex gap-3">
          <Button variant="outlineBlue" icon={Printer} onClick={() => window.print()}>Print Receipt</Button>
          <Button icon={Undo2}>Process Return</Button>
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
            <Info label="Date" value="22/03/2026" />
          </Card>

          <Card title="Asset Items">
            <div className="text-sm text-slate-500 mb-4">Total: 2</div>
            <div className="grid grid-cols-[1.4fr_1fr_1.2fr_0.8fr_1fr_1fr] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Asset</div><div>Condition Out</div><div>Condition In</div><div>Rate</div><div>Deposit</div><div>Penalty</div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[1.4fr_1fr_1.2fr_0.8fr_1fr_1fr] py-4 border-b border-slate-100 text-sm items-center">
                <div className="font-semibold">Yonex Astrox 99</div>
                <div className="text-emerald-600">Good</div>
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-3 py-1.5 w-fit">
                  Condition <ChevronDown className="w-3 h-3" />
                </div>
                <div>0.00</div>
                <div className="text-emerald-600">0.00</div>
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-3 py-1.5 w-fit">
                  None <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Payment Summary">
          <Row label="Subtotal" value="400.00" />
          <Row label="Deposit" value="0.00" color="text-emerald-600" />
          <Row label="Discount" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Amount Collected" value="400.00" />
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+10</span>
          </div>
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Net Refund" value="0.00" />
          <Row label="Total Deposit" value="0.00" />
          <Row label="Change" value="0.00" />
        </Card>
      </div>
    </div>
  );
}
