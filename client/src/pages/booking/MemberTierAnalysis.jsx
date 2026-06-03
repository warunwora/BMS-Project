import { useEffect, useState } from "react";
import { PageHeader, Card, Table } from "../../components/ui";
import { get } from "../../lib/api";

export default function MemberTierAnalysis() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    get("/bookings/member-tier-analysis")
      .then(setRows)
      .catch(console.error);
  }, []);

  const cols = [
    { key: "tier", label: "Tier" },
    { key: "total_members", label: "Members" },
    { key: "total_transaction", label: "Transactions" },
    { key: "total_revenue", label: "Revenue" },
    { key: "total_points_redeemed", label: "Points Redeemed" },
    { key: "avg_purchase", label: "Avg Purchase" },
    { key: "revenue_per_member", label: "Revenue / Member" },
  ];

  return (
    <div>
      <PageHeader title="Member Tier Analysis" />

      <Card>
        <Table
          columns={cols}
          rows={rows}
        />
      </Card>
    </div>
  );
}