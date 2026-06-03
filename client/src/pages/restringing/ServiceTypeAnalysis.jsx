import { useEffect, useState } from "react";
import { PageHeader, Card, Table } from "../../components/ui";
import { get } from "../../lib/api";

export default function ServiceTypeAnalysis() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    get("/work-orders/service-type-analysis")
      .then(setRows)
      .catch(console.error);
  }, []);

  const cols = [
    { key: "service_type", label: "Service Type" },
    { key: "line_item_count", label: "Line Items" },
    { key: "total_material_cost", label: "Material Cost" },
    { key: "total_labor_cost", label: "Labor Cost" },
    { key: "grand_total", label: "Grand Total" },
  ];

  return (
    <div>
      <PageHeader title="Service Type Analysis" />
      <Card>
        <Table columns={cols} rows={rows} />
      </Card>
    </div>
  );
}