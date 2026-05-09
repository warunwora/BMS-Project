import { Printer, Search, Pencil, Trash2 } from "lucide-react";
import { PageHeader, Button, Card, Field, Input, Select, Plus } from "../../components/ui";

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}

export default function POS() {
  return (
    <div>
      <PageHeader title="Point of Sale" actions={<Button variant="outlineBlue" icon={Printer}>Print Receipt</Button>} />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Receipt Info">
            <div className="grid grid-cols-2 gap-6 mb-5">
              <Field label="Receipt No">
                <div className="text-base font-semibold">PO20260205-01</div>
              </Field>
              <Field label="Date">
                <div className="text-base font-semibold">23/03/2026 14:30</div>
              </Field>
            </div>
            <Field label="Member ID or Phone" required>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder="Search for Member ID or Phone" />
                </div>
                <Button>Search</Button>
              </div>
            </Field>
            <div className="mt-5">
              <Field label="Method" required>
                <Select><option>Cash</option><option>Card</option><option>QR</option></Select>
              </Field>
            </div>
          </Card>

          <Card title="Purchased Items" action={<Button variant="outlineBlue" icon={Plus}>Add Item</Button>}>
            <div className="text-sm text-slate-500 mb-4">Total: 2</div>
            <div className="grid grid-cols-[0.7fr_1fr_1fr_0.8fr_0.5fr_0.8fr_auto] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Code</div><div>Name</div><div>Category</div><div>Unit Price</div><div>Qty</div><div>Ext. Price</div><div></div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[0.7fr_1fr_1fr_0.8fr_0.5fr_0.8fr_auto] py-4 border-b border-slate-100 text-sm items-center">
                <div className="font-semibold">P002</div>
                <div>Coca Cola</div>
                <div>beverage</div>
                <div>30.00</div>
                <div>1</div>
                <div>30.00</div>
                <div className="flex gap-1">
                  <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Pencil className="w-3.5 h-3.5"/></button>
                  <button className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-rose-500"/></button>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Summary & Payment">
          <Row label="Subtotal" value="400.00" />
          <Row label="Discount" value="0.00" />
          <Field label="Points to Redeem">
            <Input defaultValue="0" />
          </Field>
          <div className="text-xs text-slate-500 mt-2 mb-4">Current: 300</div>
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Net Amount Due" value="400.00" />
          <Row label="Total Deposit" value="0.00" />
          <Row label="Change" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <div className="flex justify-between mb-5">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+10</span>
          </div>
          <Button className="w-full mb-3">Confirm</Button>
          <Button variant="dangerOutline" className="w-full">Cancel</Button>
        </Card>
      </div>
    </div>
  );
}
