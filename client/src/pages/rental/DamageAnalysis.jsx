import { useEffect, useState } from "react";
import { PageHeader, Card, Table } from "../../components/ui";
import { get } from "../../lib/api";

export default function DamageAnalysis() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    get("/rentals/damage-analysis")
      .then(setRows)
      .catch(console.error);
  }, []);

  const cols = [
    { key: "asset_type", label: "Asset Type" },
    { key: "count", label: "Damaged Count" },
    { key: "damage_fee", label: "Damage Fee" },
  ];

  return (
    <div>
      <PageHeader title="Asset Damage Analysis" />

      <Card>
        <Table
          columns={cols}
          rows={rows}
        />
      </Card>
    </div>
  );
}