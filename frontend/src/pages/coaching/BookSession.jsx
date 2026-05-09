import { Search, Pencil, Trash2 } from "lucide-react";
import { PageTitle, Button, Card, Field, Plus } from "../../components/ui";

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}

function SearchField({ label, placeholder }) {
  return (
    <Field label={label} required>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder={placeholder} />
        </div>
        <Button>Search</Button>
      </div>
    </Field>
  );
}

export default function BookSession() {
  return (
    <div>
      <PageTitle back title="Book Coaching Session" />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Session Details">
            <SearchField label="Member ID or Phone" placeholder="Search for Member ID or Phone" />
            <div className="mt-5">
              <SearchField label="Coach ID" placeholder="Search for Coach ID" />
            </div>
          </Card>

          <Card title="Asset Selection" action={<Button variant="outlineBlue" icon={Plus}>Add Date</Button>}>
            <div className="text-sm text-slate-500 mb-4">Total: 2</div>
            <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.6fr_1.2fr_0.8fr_1fr_auto] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Training Date</div><div>Start Time</div><div>End Time</div><div>Hours</div><div>Skill Focus</div><div>Rate/Hr</div><div>Extended Fee</div><div></div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_0.8fr_0.8fr_0.6fr_1.2fr_0.8fr_1fr_auto] py-4 border-b border-slate-100 text-sm items-center">
                <div className="font-semibold">25/03/2026</div>
                <div>17:00</div>
                <div>19:00</div>
                <div>2</div>
                <div>Beginner Badminton</div>
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

        <Card title="Payment Summary">
          <Row label="Subtotal" value="400.00" />
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
          <Button className="w-full mb-3">Confirm Booking</Button>
          <Button variant="dangerOutline" className="w-full">Cancel</Button>
        </Card>
      </div>
    </div>
  );
}
