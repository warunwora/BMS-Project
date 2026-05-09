import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input } from "../../components/ui";

export default function CreateCourt() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title="Create New Courts" />
        <div className="flex gap-3">
          <Button variant="dangerOutline">Cancel</Button>
          <Button icon={Save}>Save</Button>
        </div>
      </div>

      <Card title="Court Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Court No" required><Input placeholder="Court No" /></Field>
          <Field label="Court Code" required><Input placeholder="C000" /></Field>
          <Field label="Weekday Price" required><Input placeholder="0.00" /></Field>
          <Field label="Weekend Price" required><Input placeholder="0.00" /></Field>
        </div>
      </Card>
    </div>
  );
}
