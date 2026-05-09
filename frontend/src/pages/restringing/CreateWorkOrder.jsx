import { Search, Calendar, Pencil, Trash2 } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, Plus } from "../../components/ui";

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}

export default function CreateWorkOrder() {
  return (
    <div>
      <PageTitle back title="Create Work Order" />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Order Details">
            <Field label="Date">
              <div className="text-base font-semibold text-slate-900">22/03/2026</div>
            </Field>
            <div className="mt-5">
              <Field label="Member ID or Phone" required>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder="Search for Member ID or Phone" />
                  </div>
                  <Button>Search</Button>
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-5">
              <Field label="Tech ID" required>
                <Select><option>Select Tech</option></Select>
              </Field>
              <Field label="Est Finish Date" required>
                <div className="relative">
                  <Input placeholder="Select Date" />
                  <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>
            </div>
          </Card>

          <Card title="Service Items" action={<Button variant="outlineBlue" icon={Plus}>Add Service</Button>}>
            <div className="text-sm text-slate-500 mb-4">Total: 2</div>
            <div className="grid grid-cols-[1.4fr_0.7fr_1fr_0.7fr_0.9fr_0.9fr_0.9fr_auto] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Asset</div><div>Code</div><div>Service</div><div>Tension</div><div>Mat. Cost</div><div>Labor Fee</div><div>Total</div><div></div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[1.4fr_0.7fr_1fr_0.7fr_0.9fr_0.9fr_0.9fr_auto] py-4 border-b border-slate-100 text-sm items-center">
                <div className="font-semibold">Yonex BG65 String</div>
                <div>P021</div>
                <div>Stringing</div>
                <div>0</div>
                <div>0.00</div>
                <div>0.00</div>
                <div>0.00</div>
                <div className="flex gap-1">
                  <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Pencil className="w-3.5 h-3.5"/></button>
                  <button className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-rose-500"/></button>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Summary">
          <Row label="Total Material" value="400.00" />
          <Row label="Total Labor" value="0.00" />
          <Row label="Member Discount" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Net" value="400.00" />
          <Row label="Total Deposit" value="0.00" />
          <Row label="Change" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <div className="flex justify-between mb-5">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+10</span>
          </div>
          <Button className="w-full mb-3">Save Work Order</Button>
          <Button variant="dangerOutline" className="w-full">Cancel</Button>
        </Card>
      </div>
    </div>
  );
}
