import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { PageTitle, Button, Card } from "../../components/ui";
import { get } from "../../lib/api";

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

export default function Receipt() {
  const { id } = useParams();
  const [r, setR] = useState(null);

  useEffect(() => {
    get(`/receipts/${id}`).then(setR);
  }, [id]);

  if (!r) return <div className="py-8 text-center text-sm text-slate-400">Loading...</div>;

  const items = r.pos_item ?? [];

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <PageTitle back title={r.code} />
        <Button variant="outlineBlue" icon={Printer} onClick={() => window.print()} className="no-print">Print Receipt</Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Receipt Info">
            <div className="grid grid-cols-2 gap-6 mb-5">
              <Info label="Receipt No" value={r.code} />
              <Info label="Date" value={r.date} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Info label="Name" value={r.member?.name} />
              <Info label="Method" value={r.method ? r.method.charAt(0).toUpperCase() + r.method.slice(1) : "-"} />
            </div>
          </Card>

          <Card title="Purchased Items">
            <div className="text-sm text-slate-500 mb-4">Total: {items.length}</div>
            <div className="grid grid-cols-[0.4fr_0.7fr_1fr_1fr_0.8fr_0.5fr_0.8fr] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>No.</div><div>Code</div><div>Name</div><div>Category</div><div>Unit Price</div><div>Qty</div><div>Ext. Price</div>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[0.4fr_0.7fr_1fr_1fr_0.8fr_0.5fr_0.8fr] py-4 border-b border-slate-100 text-sm items-center">
                <div>{i + 1}</div>
                <div className="font-semibold">{item.product?.code}</div>
                <div>{item.product?.name}</div>
                <div>{item.product?.category}</div>
                <div>{item.unit_price}</div>
                <div>{item.qty}</div>
                <div>{item.ext_price}</div>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Payment Summary">
          <Row label="Subtotal" value={r.subtotal} />
          <Row label="Member Discount" value={r.discount} />
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Amount Collected" value={r.net_amount} />
          <Row label="Total Deposit" value={r.deposit} />
          <Row label="Change" value={r.change} />
          <div className="border-t border-slate-100 my-4"></div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+{r.points_earned ?? 0}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
