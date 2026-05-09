import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Button, SearchBar, DateRangeButton, FilterPills, Table, StatusText, Pagination, Plus } from "../../components/ui";

const data = Array.from({ length: 8 }, (_, i) => ({
  code: "RV20260322-01",
  date: "22/03/2026",
  time: "18:00-20:00",
  court: "C001",
  name: "Kim Joung Un",
  status: "Upcoming",
  amount: "400.00",
  id: i + 1,
}));

export default function CourtBooking() {
  const nav = useNavigate();
  const [filter, setFilter] = useState("All");

  const cols = [
    { key: "code", label: "Reservation Code" },
    { key: "date", label: "Play Date" },
    { key: "time", label: "Time" },
    { key: "court", label: "Court No" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status", render: (r) => <StatusText>{r.status}</StatusText> },
    { key: "amount", label: "Net Amount" },
  ];

  return (
    <div>
      <PageHeader
        title="Court Booking"
        actions={<Button icon={Plus} onClick={() => nav("/booking/new")}>New Booking</Button>}
      />
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Booking No., Member Name, or Phone" />
        <DateRangeButton />
      </div>
      <div className="mb-5">
        <FilterPills items={["All", "Upcoming", "In Progress", "Completed", "Cancelled"]} value={filter} onChange={setFilter} />
      </div>
      <Table columns={cols} rows={data} onRowClick={(r) => nav(`/booking/${r.id}`)} />
      <Pagination />
    </div>
  );
}
