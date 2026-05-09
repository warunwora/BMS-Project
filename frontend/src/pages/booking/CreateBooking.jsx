import { Calendar, Clock, Search, Pencil, Trash2 } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select } from "../../components/ui";

function DateInput() {
  return (
    <div className="relative">
      <Input placeholder="Select Date" className="pr-10" />
      <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
function TimeInput() {
  return (
    <div className="relative">
      <Input placeholder="Select Time" className="pr-10" />
      <Clock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
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

const courtRows = [
  { court: "C001", date: "22/03/2026", time: "18:00", hours: "2" },
  { court: "C002", date: "22/03/2026", time: "18:00", hours: "2" },
];

export default function CreateBooking() {
  return (
    <div>
      <PageTitle back title="Create New Booking" />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Booking Information">
            <div className="grid grid-cols-2 gap-6 mb-5">
              <Field label="Booking Date">
                <div className="text-base font-semibold text-slate-900 pt-1">22/03/2026</div>
              </Field>
              <Field label="Play Date" required>
                <DateInput />
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
          </Card>

          <Card title="Court Selection">
            <div className="grid grid-cols-2 gap-6 mb-5">
              <Field label="Court No." required>
                <Select><option>Select Court</option></Select>
              </Field>
              <Field label="Hours">
                <div className="pt-2 text-base">-</div>
              </Field>
            </div>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <Field label="Start Time" required><TimeInput /></Field>
              <Field label="End Time" required><TimeInput /></Field>
              <Button>Add</Button>
            </div>
          </Card>

          <Card title="Court Summary">
            <div>
              {courtRows.map((r, i) => (
                <div key={i} className={`grid grid-cols-4 py-3 ${i > 0 ? "border-t border-slate-100" : ""}`}>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Court No.</div>
                    <div className="font-semibold">{r.court}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Date</div>
                    <div className="font-semibold">{r.date}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Start Time</div>
                    <div className="font-semibold">{r.time}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Hours</div>
                    <div className="font-semibold">{r.hours}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Summary & Payment">
          <SummaryRow label="Subtotal" value="400.00" />
          <SummaryRow label="Discount" value="0.00" />
          <Field label="Points to Redeem">
            <Input defaultValue="0" />
          </Field>
          <div className="text-xs text-slate-500 mt-2 mb-4">Current: 300</div>
          <div className="border-t border-slate-100 my-4"></div>
          <SummaryRow label="Net Amount Due" value="400.00" />
          <SummaryRow label="Total Deposit" value="0.00" />
          <SummaryRow label="Change" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <div className="flex justify-between items-center mb-5">
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
