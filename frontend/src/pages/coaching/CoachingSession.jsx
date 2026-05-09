import { useNavigate } from "react-router-dom";
import { PageHeader, Button, SearchBar, DateRangeButton, SelectButton, Table, Pagination, Plus } from "../../components/ui";

const data = Array.from({ length: 8 }, (_, i) => ({
  no: "CS-001",
  date: "25/03/2026",
  time: "17:00-19:00",
  coach: "Nattapong Srisawat",
  member: "New Gersy",
  skill: "Beginner Badminton",
  id: i + 1,
}));

export default function CoachingSession() {
  const nav = useNavigate();
  const cols = [
    { key: "no", label: "Session No" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "coach", label: "Coach" },
    { key: "member", label: "Member" },
    { key: "skill", label: "Skill Focus" },
  ];

  return (
    <div>
      <PageHeader title="Coaching Session" actions={<Button icon={Plus} onClick={() => nav("/coaching/new")}>Book Session</Button>} />
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search Session No., Member" />
        <SelectButton label="Coach" />
        <DateRangeButton />
      </div>
      <Table columns={cols} rows={data} onRowClick={(r) => nav(`/coaching/${r.id}`)} />
      <Pagination />
    </div>
  );
}
