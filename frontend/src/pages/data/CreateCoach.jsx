import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select } from "../../components/ui";

export default function CreateCoach() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title="Create New Coach" />
        <div className="flex gap-3">
          <Button variant="dangerOutline">Cancel</Button>
          <Button icon={Save}>Save</Button>
        </div>
      </div>

      <Card title="Coach Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Coach ID" required><Input placeholder="000" /></Field>
          <Field label="Name" required><Input placeholder="Name" /></Field>
          <Field label="Speciality" required>
            <Select><option>Select Speciality</option><option>Doubles Strategy</option><option>Singles</option></Select>
          </Field>
          <Field label="Hourly Rate" required><Input placeholder="0.00" /></Field>
        </div>
      </Card>
    </div>
  );
}
