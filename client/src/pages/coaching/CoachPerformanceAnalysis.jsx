
import { useEffect, useState } from "react";
import { PageHeader, Card, Table } from "../../components/ui";
import { get } from "../../lib/api";

export default function CoachPerformanceAnalysis() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    get("/coaches/coach-performance-analysis")
      .then(setRows)
      .catch(console.error);
  }, []);

  const cols = [
    { key: "coach_name", label: "Coach" },
    { key: "total_sessions", label: "Sessions" },
    { key: "total_teaching_hours", label: "Teaching Hours" },
    { key: "total_revenue", label: "Revenue" },
  ];

  return (
    <div>
      <PageHeader title="Coach Performance Analysis" />

      <Card>
        <Table
          columns={cols}
          rows={rows}
        />
      </Card>
    </div>
  );
}