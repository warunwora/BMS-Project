import { Save } from "lucide-react";
import { PageTitle, Button, Card, Field, Input, Select } from "../../components/ui";

export default function CreateProduct() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle back title="Create New Product" />
        <div className="flex gap-3">
          <Button variant="dangerOutline">Cancel</Button>
          <Button icon={Save}>Save</Button>
        </div>
      </div>

      <Card title="Product Info">
        <div className="grid grid-cols-4 gap-6">
          <Field label="Code" required><Input placeholder="P000" /></Field>
          <Field label="Name" required><Input placeholder="Name" /></Field>
          <Field label="Category" required>
            <Select><option>Select Category</option><option>instrument</option><option>beverage</option></Select>
          </Field>
          <Field label="Unit Price" required><Input placeholder="0.00" /></Field>
          <Field label="Stock"><Input placeholder="0" /></Field>
        </div>
      </Card>
    </div>
  );
}
