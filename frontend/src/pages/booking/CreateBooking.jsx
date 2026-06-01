import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { PageTitle, Button, Card, Field, Select, Tooltip, MemberSearch } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, post } from "../../lib/api";
import { calculateDiscount, calculatePoints } from "../../lib/tierCalculations";

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

export default function CreateBooking() {
  const nav = useNavigate();
  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];
  const HOURLY_RATE = 180;
  const [courts, setCourts] = useState([]);
  const [member, setMember] = useState(null);
  const [playDate, setPlayDate] = useState("");
  const [courtId, setCourtId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [courtRows, setCourtRows] = useState([]);
  const [courtsLoading, setCourtsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [discount, setDiscount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    setCourtsLoading(true);
    get("/courts").then(setCourts).catch((e) => toast(e.message, "error")).finally(() => setCourtsLoading(false));
  }, []);

  useEffect(() => {
    async function updateCalculations() {
      const subtotal = courtRows.reduce((sum, r) => sum + HOURLY_RATE * r.hours, 0);
      if (!subtotal || !member?.id) {
        setDiscount(0);
        setPointsEarned(0);
        return;
      }
      try {
        const disc = await calculateDiscount(subtotal, member.tier_id);
        const net = subtotal - disc;
        const pts = await calculatePoints(net, member.tier_id);
        setDiscount(disc);
        setPointsEarned(pts);
      } catch (e) {
        toast(e.message, "error");
      }
    }
    updateCalculations();
  }, [courtRows, member]);


  function calcHours(start, end) {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  }

  function addCourt() {
    if (!courtId || !startTime || !endTime) { toast("Select court, start time, and end time", "warning"); return; }
    if (startTime >= endTime) { toast("End time must be after start time", "warning"); return; }
    const court = courts.find((c) => c.id === parseInt(courtId));
    const hours = calcHours(startTime, endTime);
    setCourtRows((r) => [...r, { court_id: courtId, court, date: playDate, start_time: startTime, end_time: endTime, hours }]);
  }

  function removeRow(i) { setCourtRows((r) => r.filter((_, idx) => idx !== i)); }

  const subtotal = courtRows.reduce((sum, r) => sum + HOURLY_RATE * r.hours, 0);

  async function handleConfirm() {
    const e = {};
    if (!playDate) e.playDate = "Play date is required";
    if (courtRows.length === 0) e.courts = "Add at least one court slot";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    try {
      const booking = await post("/bookings", {
        member_id: member?.id,
        booking_date: today,
        play_date: playDate,
        status: "Upcoming",
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        net_amount: (subtotal - discount).toFixed(2),
        points_earned: pointsEarned,
        courts: courtRows.map(({ court_id, date, start_time, end_time, hours }) => ({ court_id, date, start_time, end_time, hours })),
      });
      toast("Booking created successfully");
      nav(`/booking/${booking.id}`);
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <PageTitle back title="Create New Booking" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Booking Information">
            <div className="grid grid-cols-2 gap-6 mb-5">
              <Field label="Booking Date">
                <div className="text-base font-semibold text-slate-900 pt-1">{today}</div>
              </Field>
              <Field label="Play Date" required>
                <input type="date" value={playDate} onChange={(e) => { setPlayDate(e.target.value); setErrors((p) => ({ ...p, playDate: "" })); }} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.playDate ? "border-red-400" : "border-slate-200"}`} />
                {errors.playDate && <p className="text-xs text-red-500 mt-1">{errors.playDate}</p>}
              </Field>
            </div>
            <Field label="Member">
              <MemberSearch selected={member} onSelect={setMember} />
            </Field>
          </Card>

          <Card title="Court Selection">
            <div className="grid grid-cols-2 gap-6 mb-5">
              <Field label="Court No." required>
                {courtsLoading ? <div className="text-sm text-slate-500">Loading courts...</div> :
                  courts.length === 0 ? <div className="text-sm text-amber-600">No courts found.</div> :
                  <Select value={courtId} onChange={(e) => setCourtId(e.target.value)}>
                    <option value="">Select Court</option>
                    {courts.map((c) => <option key={c.id} value={c.id}>{c.court_no} - {c.court_code}</option>)}
                  </Select>}
              </Field>
              <Field label="Hours">
                <div className="pt-2 text-base font-semibold">{calcHours(startTime, endTime) || "-"}</div>
              </Field>
            </div>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <Field label="Start Time" required>
                <Select value={startTime} onChange={(e) => { setStartTime(e.target.value); if (endTime && e.target.value >= endTime) setEndTime(""); }}>
                  <option value="">Select Start Time</option>
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="End Time" required>
                <Select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                  <option value="">Select End Time</option>
                  {TIME_OPTIONS.filter((t) => !startTime || t > startTime).map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
              <Tooltip text="Add court to booking"><Button onClick={addCourt}>Add</Button></Tooltip>
            </div>
          </Card>

          <Card title="Court Summary">
            {errors.courts && <p className="text-xs text-red-500 mb-2">{errors.courts}</p>}
            {courtRows.length === 0 && <div className="text-sm text-slate-400 py-2">No courts added yet.</div>}
            {courtRows.map((r, i) => (
              <div key={i} className={`grid grid-cols-[1fr_1fr_1fr_1fr_auto] py-3 ${i > 0 ? "border-t border-slate-100" : ""}`}>
                <div><div className="text-xs text-slate-500 mb-1">Court No.</div><div className="font-semibold">{r.court?.court_code}</div></div>
                <div><div className="text-xs text-slate-500 mb-1">Date</div><div className="font-semibold">{r.date}</div></div>
                <div><div className="text-xs text-slate-500 mb-1">Start Time</div><div className="font-semibold">{r.start_time}</div></div>
                <div><div className="text-xs text-slate-500 mb-1">Hours</div><div className="font-semibold">{r.hours}</div></div>
                <button onClick={() => removeRow(i)} className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center self-center hover:bg-rose-200 transition-all active:scale-90">
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Summary & Payment">
          <SummaryRow label="Subtotal"      value={subtotal.toFixed(2)} />
          <SummaryRow label="Discount"      value={discount.toFixed(2)} />
          <div className="border-t border-slate-100 my-4" />
          <SummaryRow label="Net Amount Due" value={(subtotal - discount).toFixed(2)} />
          <div className="border-t border-slate-100 my-4" />
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+{pointsEarned}</span>
          </div>
          <Tooltip text="Confirm and save booking">
            <Button className="w-full mb-3" onClick={handleConfirm}>Confirm Booking</Button>
          </Tooltip>
          <Button variant="dangerOutline" className="w-full" onClick={() => nav(-1)}>Cancel</Button>
        </Card>
      </div>
    </div>
  );
}
