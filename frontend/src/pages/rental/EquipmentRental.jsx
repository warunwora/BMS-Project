import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Button, SearchBar, DateRangeButton, FilterPills, Table, StatusText, Pagination, Plus } from "../../components/ui";

const data = Array.from({ length: 8 }, (_, i) => ({
  rental: "RI20260205-01",
  date: "22/03/2026",
  name: "0.00",
  fee: "0.00",
  status: "Rented",
  id: i + 1,
}));

export default function EquipmentRental() {
  const nav = useNavigate();
  const [filter, setFilter] = useState("All");
  const cols = [
    { key: "rental", label: "Rental No" },
    { key: "date", label: "Date" },
    { key: "name", label: "Name" },
    { key: "fee", label: "Total Fee" },
    { key: "status", label: "Status", render: (r) => <StatusText>{r.status}</StatusText> },
  ];

  return (
    <div>
      <PageHeader title="Equipment Rental" actions={<Button icon={Plus} onClick={() => nav("/rental/new")}>New Rental</Button>} />
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Rental No., Member Name" />
        <DateRangeButton />
      </div>
      <div className="mb-5">
        <FilterPills items={["All", "Rented", "Returned", "Overdue"]} value={filter} onChange={setFilter} />
      </div>
      <Table columns={cols} rows={data} onRowClick={(r) => nav(`/rental/${r.id}`)} />
      <Pagination />
    </div>
  );
}
