import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Plus, MemberSearch, CoachSearch } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, post } from "../../lib/api";

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}

export default function BookSession() {
  const nav = useNavigate();
  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [member, setMember] = useState(null);
  const [coach, setCoach] = useState(null);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ training_date: "", start_time: "", end_time: "", skill_focus: "" });
  const [errors, setErrors] = useState({});


  function calcHours(start, end) {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  }

  function addSlot() {
    const hours = calcHours(newSlot.start_time, newSlot.end_time);
    const rate = parseFloat(coach?.hourly_rate || 0);
    setSlots((s) => [...s, { ...newSlot, hours, rate, extended_fee: (rate * hours).toFixed(2) }]);
    setNewSlot({ training_date: "", start_time: "", end_time: "", skill_focus: "" });
  }

  function removeSlot(i) { setSlots((s) => s.filter((_, idx) => idx !== i)); }

  const subtotal = slots.reduce((s, sl) => s + parseFloat(sl.extended_fee || 0), 0);

  async function handleConfirm() {
    const e = {};
    if (!member) e.member = "Member is required";
    if (!coach) e.coach = "Coach is required";
    if (slots.length === 0) e.slots = "Add at least one slot";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    try {
      const session = await post("/sessions", {
        member_id: member?.id,
        coach_id: coach?.id,
        booking_date: today,
        skill_focus: slots[0]?.skill_focus ?? "",
        subtotal: subtotal.toFixed(2),
        net_amount: subtotal.toFixed(2),
        slots,
      });
      toast("Session booked successfully");
      nav(`/coaching/${session.id}`);
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <PageTitle back title="Book Coaching Session" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card title="Session Details">
            <Field label="Member">
              <MemberSearch selected={member} onSelect={(m) => { setMember(m); setErrors((p) => ({ ...p, member: "" })); }} />
              {errors.member && <p className="text-xs text-red-500 mt-1">{errors.member}</p>}
            </Field>
            <div className="mt-5">
              <Field label="Coach" required>
                <CoachSearch selected={coach} onSelect={(c) => { setCoach(c); setErrors((p) => ({ ...p, coach: "" })); }} />
                {errors.coach && <p className="text-xs text-red-500 mt-1">{errors.coach}</p>}
              </Field>
            </div>
          </Card>

          <Card title="Session Slots" action={<Button variant="outlineBlue" icon={Plus} onClick={addSlot}>Add Date</Button>}>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <Field label="Training Date"><input type="date" value={newSlot.training_date} onChange={(e) => setNewSlot((s) => ({ ...s, training_date: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" /></Field>
              <Field label="Start Time"><input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot((s) => ({ ...s, start_time: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" /></Field>
              <Field label="End Time"><input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot((s) => ({ ...s, end_time: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" /></Field>
              <Field label="Skill Focus"><Input value={newSlot.skill_focus} onChange={(e) => setNewSlot((s) => ({ ...s, skill_focus: e.target.value }))} placeholder="e.g. Beginner" /></Field>
            </div>
            {errors.slots && <p className="text-xs text-red-500 mb-2">{errors.slots}</p>}
            <div className="text-sm text-slate-500 mb-4">Total: {slots.length}</div>
            <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.6fr_1.2fr_0.8fr_1fr_auto] text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div>Training Date</div><div>Start</div><div>End</div><div>Hours</div><div>Skill Focus</div><div>Rate/Hr</div><div>Extended Fee</div><div></div>
            </div>
            {slots.map((sl, i) => (
              <div key={i} className="grid grid-cols-[1fr_0.8fr_0.8fr_0.6fr_1.2fr_0.8fr_1fr_auto] py-4 border-b border-slate-100 text-sm items-center">
                <div className="font-semibold">{sl.training_date}</div>
                <div>{(sl.start_time||"").slice(0,5)}</div>
                <div>{(sl.end_time||"").slice(0,5)}</div>
                <div>{sl.hours}</div>
                <div>{sl.skill_focus}</div>
                <div>{sl.rate}</div>
                <div>{sl.extended_fee}</div>
                <button onClick={() => removeSlot(i)} className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Payment Summary">
          <Row label="Subtotal" value={subtotal.toFixed(2)} />
          <Row label="Member Discount" value="0.00" />
          <div className="border-t border-slate-100 my-4"></div>
          <Row label="Net" value={subtotal.toFixed(2)} />
          <div className="border-t border-slate-100 my-4"></div>
          <div className="flex justify-between mb-5">
            <span className="text-sm text-slate-500">Points Earned</span>
            <span className="text-base font-bold text-indigo-600">+{Math.floor(subtotal / 10)}</span>
          </div>
          <Button className="w-full mb-3" onClick={handleConfirm}>Confirm Booking</Button>
          <Button variant="dangerOutline" className="w-full" onClick={() => nav(-1)}>Cancel</Button>
        </Card>
      </div>
    </div>
  );
}
