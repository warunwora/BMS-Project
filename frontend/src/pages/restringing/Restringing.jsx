import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Button, SearchBar, DateRangeButton, SelectButton, FilterPills, Table, StatusText, Pagination, Plus } from "../../components/ui";

const data = Array.from({ length: 8 }, (_, i) => ({
  wo: "WO-001",
  date: "22/03/2026",
  name: "Lee Chong",
  tech: "T-01",
  finish: "24/03/2026",
  status: "Pending",
  id: i + 1,
}));

export default function Restringing() {
  const nav = useNavigate();
  const [filter, setFilter] = useState("All");
  const cols = [
    { key: "wo", label: "WO No" },
    { key: "date", label: "Date" },
    { key: "name", label: "Name" },
    { key: "tech", label: "Tech ID" },
    { key: "finish", label: "Est Finish Date" },
    { key: "status", label: "Status", render: (r) => <StatusText>{r.status}</StatusText> },
  ];

  return (
    <div>
      <PageHeader title="Restringing Service" actions={<Button icon={Plus} onClick={() => nav("/restringing/new")}>New Work Order</Button>} />
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search WO No., Member" />
        <SelectButton label="Technician" />
        <DateRangeButton />
      </div>
      <div className="mb-5">
        <FilterPills items={["All", "Pending", "In Progress", "Completed"]} value={filter} onChange={setFilter} />
      </div>
      <Table columns={cols} rows={data} onRowClick={(r) => nav(`/restringing/${r.id}`)} />
      <Pagination />
    </div>
  );
}
