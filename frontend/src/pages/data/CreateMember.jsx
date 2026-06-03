import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select, Tooltip } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { post, get } from "../../lib/api";

export default function CreateMember() {
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", phone: "", email: "", gender: "Male", tier_id: 1 });
  const [tiers, setTiers] = useState([]);

  // Load tiers on mount
  useEffect(() => {
    get("/tiers")
      .then(setTiers)
      .catch((e) => toast(e.message, "error"));
  }, []);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.name.trim()) { toast("Name is required", "warning"); return; }
    if (!form.phone.trim()) { toast("Phone is required", "warning"); return; }
    try {
      await post("/members", form);
      toast("Member created successfully");
      nav("/data/members");
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title="Create New Member" />
        <div className="flex gap-3">
          <Button variant="dangerOutline" onClick={() => nav(-1)}>Cancel</Button>
          <Tooltip text="Save new member"><Button icon={Save} onClick={handleSave}>Save</Button></Tooltip>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <Card title="Customer Info">
          <div className="grid grid-cols-4 gap-6">
            <Field label="Name" required><Input placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Phone" required><Input placeholder="0000000000" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Email"><Input placeholder="email@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Gender" required>
              <Select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option>Male</option><option>Female</option>
              </Select>
            </Field>
          </div>
        </Card>
        <Card title="Membership Info">
          <div className="grid grid-cols-3 gap-6">
            <Field label="Membership Tier" required>
              <Select value={form.tier_id} onChange={(e) => set("tier_id", parseInt(e.target.value))}>
                {tiers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Current Reward Points"><div className="text-base font-semibold pt-1">0</div></Field>
            <Field label="Lifetime Points"><div className="text-base font-semibold pt-1">0</div></Field>
          </div>
        </Card>
      </div>
    </div>
  );
}
