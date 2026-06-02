import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutList, ShoppingBag, RotateCcw, AlertTriangle } from "lucide-react";
import { PageHeader, Button, SearchBar, FilterPills, DateRangePicker, ExportDropdown, Table, StatusText, Pagination, Tooltip, ConfirmModal, Plus } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

export default function EquipmentRental() {
  const nav = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  function load() {
    setLoading(true);
    get("/rentals", { search, status: filter === "All" ? "" : filter })
      .then(setData)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); setPage(1); }, [filter, search]);

  function handleDelete(row) {
    setConfirm({
      title: "Delete Rental?",
      message: `Delete rental ${row.code}?`,
      onConfirm: async () => {
        try { await del(`/rentals/${row.id}`); toast("Rental deleted"); load(); }
        catch (e) { toast(e.message, "error"); }
        setConfirm(null);
      },
    });
  }

  const filtered = data.filter((r) => {
    if (dateRange.from && r.date < dateRange.from) return false;
    if (dateRange.to && r.date > dateRange.to) return false;
    return true;
  });

  useEffect(() => { setPage(1); }, [dateRange]);

  const cols = [
    { key: "code",      label: "Rental No" },
    { key: "date",      label: "Date" },
    { key: "member",    label: "Name",     render: (r) => r.member?.name },
    { key: "total_fee", label: "Total Fee" },
    { key: "status",    label: "Status",   render: (r) => <StatusText>{r.status}</StatusText> },
  ];

  return (
    <div>
      <PageHeader
        title="Equipment Rental"
        actions={
          <>
            <ExportDropdown data={filtered} filename="rentals" />
            <Button
              variant="outlineBlue"
              onClick={() => nav("/rental/damage-analysis")}
            >
              Damage Analysis
            </Button>
            <Tooltip text="Create new rental">
              <Button icon={Plus} onClick={() => nav("/rental/new")}>New Rental</Button>
            </Tooltip>
          </>
        }
      />
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search by Rental No., Member Name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <DateRangePicker from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
      </div>
      <div className="mb-5">
        <FilterPills items={["All", "Rented", "Returned", "Overdue"]} value={filter} onChange={setFilter}
          icons={{ All: LayoutList, Rented: ShoppingBag, Returned: RotateCcw, Overdue: AlertTriangle }} />
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {!loading && filtered.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No rentals found.</div>}
      <Table columns={cols} rows={filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)} onRowClick={(r) => nav(`/rental/${r.id}`)} onEdit={(r) => nav(`/rental/${r.id}`)} onDelete={handleDelete} />
      <Pagination page={page} onPage={setPage} totalRows={filtered.length} rowsPerPage={rowsPerPage} onRowsPerPage={(n) => { setRowsPerPage(n); setPage(1); }} />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
