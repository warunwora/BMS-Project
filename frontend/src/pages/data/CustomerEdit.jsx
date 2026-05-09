import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select } from "../../components/ui";

export default function CustomerEdit() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title="Kim Joung Un" />
        <div className="flex gap-3">
          <Button variant="dangerOutline">Cancel</Button>
          <Button icon={Save}>Save</Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card title="Customer Info">
          <div className="grid grid-cols-4 gap-6">
            <Field label="Name" required><Input defaultValue="Kim Joung Un" /></Field>
            <Field label="Phone" required><Input defaultValue="834567890" /></Field>
            <Field label="Email"><Input defaultValue="kim@example.com" /></Field>
            <Field label="Gender" required>
              <Select defaultValue="Male"><option>Male</option><option>Female</option></Select>
            </Field>
          </div>
        </Card>

        <Card title="Membership Info">
          <div className="grid grid-cols-3 gap-6">
            <Field label="Membership Tier" required>
              <Select defaultValue="Bronze"><option>Bronze</option><option>Silver</option><option>Gold</option><option>Premium</option></Select>
            </Field>
            <Field label="Current Reward Points">
              <div className="text-base font-semibold">500</div>
            </Field>
            <Field label="Lifetime Points">
              <div className="text-base font-semibold">1,500</div>
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}
