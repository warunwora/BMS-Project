import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, CheckCircle2, XCircle } from "lucide-react";
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
function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-900">{value ?? "0.00"}</span>
    </div>
  );
}

export default function WorkOrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [wo, setWo] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => { get(`/work-orders/${id}`).then(setWo).catch((e) => toast(e.message, "error")); }, [id]);

  async function doCancel() {
    try { await del(`/work-orders/${id}`); toast("Work order cancelled"); nav("/restringing"); }
    catch (e) { toast(e.message, "error"); }
    setConfirmCancel(false);
  }

  async function doComplete() {
    try {
      await put(`/work-orders/${id}`, { status: "Completed" });
      toast("Work order marked as completed");
      nav("/restringing");
    } catch (e) { toast(e.message, "error"); }
    setConfirm(false);
  }

  if (!wo) return <div className="py-8 text-center text-sm text-slate-400">Loading...</div>;

  const items = wo.work_order_item ?? [];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageTitle back title={wo.code}>
          <span className="text-indigo-600 font-medium">{wo.status}</span>
        </PageTitle>
        <div className="flex no-print" style={{ gap: "12px" }}>
          <Tooltip text="Print work order ticket">
            <Button variant="outlineBlue" icon={Printer} onClick={() => window.print()}>Print Ticket</Button>
          </Tooltip>
          <Tooltip text="Cancel this order">
            <Button variant="danger" icon={XCircle} onClick={() => setConfirmCancel(true)}>Cancel Order</Button>
          </Tooltip>
          <Tooltip text="Mark this order as completed">
            <Button icon={CheckCircle2} onClick={() => setConfirm(true)}>Mark as Completed</Button>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Order Info">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Info label="Name"  value={wo.member?.name} />
              <Info label="Phone" value={wo.member?.phone} />
              <Info label="Tier"  value={wo.member?.tier_id} />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Info label="Date"       value={wo.date} />
              <Info label="Tech ID"    value={wo.tech_id} />
              <Info label="Est. Finish" value={wo.est_finish_date} />
            </div>
          </Card>
          <Card title="Service Items">
            <div className="text-sm text-slate-500 mb-4">Total: {items.length}</div>
            <div className="grid grid-cols-[1.4fr_0.7fr_1fr_0.7fr_0.8fr_0.8fr_0.8fr] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Model</div><div>Code</div><div>Service</div><div>Tension</div><div>Mat. Cost</div><div>Labor Fee</div><div>Total</div>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1.4fr_0.7fr_1fr_0.7fr_0.8fr_0.8fr_0.8fr] py-4 border-b border-slate-100 text-sm">
                <div className="font-semibold">{item.asset}</div>
                <div>{item.product_code}</div>
                <div>{item.service}</div>
                <div>{item.tension}</div>
                <div>{item.material_cost}</div>
                <div>{item.labor_fee}</div>
                <div>{(parseFloat(item.material_cost || 0) + parseFloat(item.labor_fee || 0)).toFixed(2)}</div>
              </div>
            ))}
          </Card>
        </div>
        <Card title="Payment Summary">
          <Row label="Subtotal"         value={wo.subtotal} />
          <Row label="Total Labor"      value={wo.total_labor} />
          <Row label="Member Discount"  value={wo.discount} />
          <div className="border-t border-slate-100 my-4" />
          <Row label="Net"           value={wo.net_amount} />
          <Row label="Total Deposit" value={wo.deposit} />
          <Row label="Change"        value={wo.change} />
          <div className="border-t border-slate-100 my-4" />
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+{wo.points_earned ?? 0}</span>
          </div>
        </Card>
      </div>

      <ConfirmModal open={confirm} title="Mark as Completed?" message={`Mark work order ${wo.code} as completed?`} confirmText="Confirm" variant="primary" onConfirm={doComplete} onCancel={() => setConfirm(false)} />
      <ConfirmModal open={confirmCancel} title="Cancel Work Order?" message={`Cancel work order ${wo.code}? This will delete the record.`} confirmText="Cancel Order" onConfirm={doCancel} onCancel={() => setConfirmCancel(false)} />
    </div>
  );
}
