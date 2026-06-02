import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader, Button, SearchBar, DateRangePicker, FilterDropdown, ExportDropdown, Table, Pagination, Tooltip, ConfirmModal, Plus } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

export default function CoachingSession() {
  const nav = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const coachFilter = searchParams.get("coach") || "";
  const dateRange = { from: searchParams.get("from") || "", to: searchParams.get("to") || "" };

  function setSearch(v) { setSearchParams(p => { const n = new URLSearchParams(p); v ? n.set("search", v) : n.delete("search"); return n; }, { replace: true }); }
  function setCoachFilter(v) { setSearchParams(p => { const n = new URLSearchParams(p); v ? n.set("coach", v) : n.delete("coach"); return n; }, { replace: true }); }
  function setDateRange({ from, to }) { setSearchParams(p => { const n = new URLSearchParams(p); from ? n.set("from", from) : n.delete("from"); to ? n.set("to", to) : n.delete("to"); return n; }, { replace: true }); }

  const [data, setData] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  function load() {
    setLoading(true);
    get("/sessions", { search }).then(setData).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    get("/coaches").then((c) => setCoaches(c.map((x) => x.name))).catch(() => {});
  }, [search]);

  function handleDelete(row) {
    setConfirm({
      title: "Delete Session?",
      message: `Delete coaching session ${row.code}?`,
      onConfirm: async () => {
        try { await del(`/sessions/${row.id}`); toast("Session deleted"); load(); }
        catch (e) { toast(e.message, "error"); }
        setConfirm(null);
      },
    });
  }

  const filtered = data.filter((r) => {
    if (coachFilter && r.coach?.name !== coachFilter) return false;
    if (dateRange.from && r.booking_date < dateRange.from) return false;
    if (dateRange.to && r.booking_date > dateRange.to) return false;
    return true;
  });

  useEffect(() => { setPage(1); }, [coachFilter, dateRange.from, dateRange.to]);

  const cols = [
    { key: "code",         label: "Session No" },
    { key: "booking_date", label: "Date" },
    { key: "time",         label: "Time", render: (r) => r.start_time ? `${(r.start_time||"").slice(0,5)} - ${(r.end_time||"").slice(0,5)}` : "-" },
    { key: "coach",        label: "Coach",  render: (r) => r.coach?.name },
    { key: "member",       label: "Member", render: (r) => r.member?.name },
    { key: "skill_focus",  label: "Skill Focus" },
  ];

  return (
    <div>
      <PageHeader
        title="Coaching Session"
        actions={
          <>
            <ExportDropdown data={filtered} filename="coaching-sessions" />
            <Tooltip text="Book a new coaching session">
              <Button icon={Plus} onClick={() => nav("/coaching/new")}>Book Session</Button>
            </Tooltip>
          </>
        }
      />
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search Session No., Member" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterDropdown label="Coach" options={coaches} value={coachFilter} onChange={setCoachFilter} />
        <DateRangePicker from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {!loading && filtered.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No sessions found.</div>}
      <Table columns={cols} rows={filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)} onRowClick={(r) => nav(`/coaching/${r.id}`)} onEdit={(r) => nav(`/coaching/${r.id}/edit`)} onDelete={handleDelete} />
      <Pagination page={page} onPage={setPage} totalRows={filtered.length} rowsPerPage={rowsPerPage} onRowsPerPage={(n) => { setRowsPerPage(n); setPage(1); }} />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
