import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutList, Clock, CheckCircle2 } from "lucide-react";
import { PageHeader, Button, SearchBar, FilterPills, DateRangePicker, FilterDropdown, ExportDropdown, Table, StatusText, Pagination, Tooltip, ConfirmModal, Plus } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get, del } from "../../lib/api";

export default function Restringing() {
  const nav = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [techFilter, setTechFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  function load() {
    setLoading(true);
    get("/work-orders", { search, status: filter === "All" ? "" : filter })
      .then(setData)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); setPage(1); }, [filter, search]);

  function handleDelete(row) {
    setConfirm({
      title: "Delete Work Order?",
      message: `Delete work order ${row.code}?`,
      onConfirm: async () => {
        try { await del(`/work-orders/${row.id}`); toast("Work order deleted"); load(); }
        catch (e) { toast(e.message, "error"); }
        setConfirm(null);
      },
    });
  }

  const techOptions = [...new Set(data.map((r) => r.tech_id).filter(Boolean))];

  const filtered = data.filter((r) => {
    if (techFilter && r.tech_id !== techFilter) return false;
    if (dateRange.from && r.date < dateRange.from) return false;
    if (dateRange.to && r.date > dateRange.to) return false;
    return true;
  });

  useEffect(() => { setPage(1); }, [techFilter, dateRange]);

  const cols = [
    { key: "code",            label: "WO No" },
    { key: "date",            label: "Date" },
    { key: "member",          label: "Name",           render: (r) => r.member?.name },
    { key: "tech_id",         label: "Tech ID" },
    { key: "est_finish_date", label: "Est Finish Date" },
    { key: "status",          label: "Status",         render: (r) => <StatusText>{r.status}</StatusText> },
  ];

  return (
    <div>
      <PageHeader
        title="Restringing Service"
        actions={
          <>
            <ExportDropdown data={filtered} filename="work-orders" />
            <Tooltip text="Create new work order">
              <Button icon={Plus} onClick={() => nav("/restringing/new")}>New Work Order</Button>
            </Tooltip>
          </>
        }
      />
      <div className="flex gap-3 mb-5">
        <SearchBar placeholder="Search WO No., Member" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterDropdown label="Technician" options={techOptions} value={techFilter} onChange={setTechFilter} />
        <DateRangePicker from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
      </div>
      <div className="mb-5">
        <FilterPills items={["All", "Pending", "Completed"]} value={filter} onChange={setFilter}
          icons={{ All: LayoutList, Pending: Clock, Completed: CheckCircle2 }} />
      </div>
      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {!loading && filtered.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No work orders found.</div>}
      <Table columns={cols} rows={filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)} onRowClick={(r) => nav(`/restringing/${r.id}`)} onEdit={(r) => nav(`/restringing/${r.id}`)} onDelete={handleDelete} />
      <Pagination page={page} onPage={setPage} totalRows={filtered.length} rowsPerPage={rowsPerPage} onRowsPerPage={(n) => { setRowsPerPage(n); setPage(1); }} />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText="Delete" onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
