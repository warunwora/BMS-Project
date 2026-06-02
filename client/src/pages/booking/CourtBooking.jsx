import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { LayoutList, Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader, Button, SearchBar, FilterPills, DateRangePicker, FilterDropdown, ExportDropdown, Table, StatusText, Pagination, Tooltip, ConfirmModal, Plus } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, put, del } from "../../lib/api";

function normalizeRows(rows = []) {
  return rows.map((row) => {
    const bc = row.booking_court || [];
    return {
      ...row,
      court: bc.length ? bc.map((c) => c.court ? `${c.court.court_no} - ${c.court.court_code}` : c.court_id).filter(Boolean).join(", ") : "-",
      time:  bc.length ? bc.map((c) => `${(c.start_time||"").slice(0,5)} - ${(c.end_time||"").slice(0,5)}`.trim()).join(", ") : "-",
    };
  });
}

export default function CourtBooking() {
  const nav = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "All";
  const search = searchParams.get("search") || "";
  const dateRange = { from: searchParams.get("from") || "", to: searchParams.get("to") || "" };

  function setFilter(v) { setSearchParams(p => { const n = new URLSearchParams(p); v && v !== "All" ? n.set("filter", v) : n.delete("filter"); return n; }, { replace: true }); }
  function setSearch(v) { setSearchParams(p => { const n = new URLSearchParams(p); v ? n.set("search", v) : n.delete("search"); return n; }, { replace: true }); }
  function setDateRange({ from, to }) { setSearchParams(p => { const n = new URLSearchParams(p); from ? n.set("from", from) : n.delete("from"); to ? n.set("to", to) : n.delete("to"); return n; }, { replace: true }); }

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  function load() {
    setLoading(true);
    get("/bookings", { search, status: filter === "All" ? "" : filter, from: dateRange.from, to: dateRange.to })
      .then((rows) => setData(normalizeRows(rows)))
      .catch((err) => { toast(err.message, "error"); setData([]); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [filter, search, dateRange.from, dateRange.to]);

  function handleDelete(row) {
    setConfirm({
      title: "Cancel Booking?",
      message: `Cancel reservation ${row.code}? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await del(`/bookings/${row.id}`);
          toast("Booking cancelled");
          load();
        } catch (e) { toast(e.message, "error"); }
        setConfirm(null);
      },
    });
  }

  const cols = [
    { key: "code",       label: "Reservation Code" },
    { key: "play_date",  label: "Play Date" },
    { key: "time",       label: "Time",     render: (r) => <div className="whitespace-normal">{r.time}</div> },
    { key: "court",      label: "Court No", render: (r) => <div className="whitespace-normal">{r.court}</div> },
    { key: "member",     label: "Name",     render: (r) => r.member?.name },
    { key: "status",     label: "Status",   render: (r) => <StatusText>{r.status}</StatusText> },
    { key: "net_amount", label: "Net Amount" },
  ];

  return (
    <div>
      <PageHeader
        title="Court Booking"
        actions={
          <>
            <ExportDropdown data={data} filename="court-bookings" />
            <Tooltip text="Create new booking">
              <Button icon={Plus} onClick={() => nav("/booking/new")}>New Booking</Button>
            </Tooltip>
          </>
        }
      />
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Reservation No., Member Name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <DateRangePicker from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
      </div>
      <div className="mb-5">
        <FilterPills items={["All", "Upcoming", "In Progress", "Completed", "Cancelled"]} value={filter} onChange={setFilter}
          icons={{ All: LayoutList, Upcoming: Clock, "In Progress": Loader2, Completed: CheckCircle2, Cancelled: XCircle }} />
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {!loading && data.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No bookings found.</div>}
      <Table
        columns={cols}
        rows={data.slice((page - 1) * rowsPerPage, page * rowsPerPage)}
        onRowClick={(r) => nav(`/booking/${r.id}`)}
        onEdit={(r) => nav(`/booking/${r.id}/edit`)}
        onDelete={handleDelete}
      />
      <Pagination page={page} onPage={setPage} totalRows={data.length} rowsPerPage={rowsPerPage} onRowsPerPage={(n) => { setRowsPerPage(n); setPage(1); }} />
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmText="Cancel Booking"
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
