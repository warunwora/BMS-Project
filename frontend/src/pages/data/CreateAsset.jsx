import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select } from "../../components/ui";

export default function CreateAsset() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title="Create New Assets" />
        <div className="flex gap-3">
          <Button variant="dangerOutline">Cancel</Button>
          <Button icon={Save}>Save</Button>
        </div>
      </div>

      <Card title="Asset Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Code" required><Input placeholder="R000" /></Field>
          <Field label="Brand" required><Input placeholder="Brand" /></Field>
          <Field label="Type" required>
            <Select><option>Select Type</option><option>shoes</option><option>racket</option></Select>
          </Field>
          <Field label="Base Rate" required><Input placeholder="0.00" /></Field>
        </div>
      </Card>
    </div>
  );
}
