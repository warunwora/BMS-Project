import { Printer, Pencil, Trash2 } from "lucide-react";
import { PageTitle, Button, Card, Plus } from "../../components/ui";

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

export default function Receipt() {
  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <PageTitle back title="PO20260205-01" />
        <Button variant="outlineBlue" icon={Printer}>Print Receipt</Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Receipt Info">
            <div className="grid grid-cols-2 gap-6 mb-5">
              <Info label="Receipt No" value="PO20260205-01" />
              <Info label="Date" value="23/03/2026 14:30" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Info label="Name" value="Lee Chong" />
              <Info label="Method" value="Cash" />
            </div>
          </Card>

          <Card title="Purchased Items" action={<Button variant="outlineBlue" icon={Plus}>Add Item</Button>}>
            <div className="text-sm text-slate-500 mb-4">Total: 2</div>
            <div className="grid grid-cols-[0.4fr_0.7fr_1fr_1fr_0.8fr_0.5fr_0.8fr_auto] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>No.</div><div>Code</div><div>Name</div><div>Category</div><div>Unit Price</div><div>Qty</div><div>Ext. Price</div><div></div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[0.4fr_0.7fr_1fr_1fr_0.8fr_0.5fr_0.8fr_auto] py-4 border-b border-slate-100 text-sm items-center">
                <div>{i}</div>
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

        <Card title="Payment Summary">
          <Row label="Subtotal" value="400.00" />
          <Row label="Member Discount" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Amount Collected" value="400.00" />
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
