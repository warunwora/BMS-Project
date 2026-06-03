import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Button, SearchBar, Table, Pagination, ExportDropdown } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get } from "../../lib/api";

export default function WorkOrderLineItems() {
  const nav = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all line items
  function load() {
    setLoading(true);
    get("/work-orders/line-items", { search })
      .then(setData)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search]);

  const cols = [
    { key: "work_order_code", label: "WO Code" },
    { key: "work_order_date", label: "Date" },
    { key: "service_name", label: "Service Type" },
    {
      key: "racket_name",
      label: "Racket",
      render: (r) => (
        <div>
          <div className="font-semibold">{r.racket_name || "-"}</div>
          {r.racket_code && <div className="text-xs text-slate-400">{r.racket_code}</div>}
        </div>
      ),
    },
    {
      key: "product_name",
      label: "Product",
      render: (r) => (
        <div>
          <div className="font-semibold">{r.product_name || "-"}</div>
          {r.product_code && <div className="text-xs text-slate-400">{r.product_code}</div>}
        </div>
      ),
    },
    { key: "tension", label: "Tension" },
    { key: "material_cost", label: "Material Cost" },
    { key: "labor_fee", label: "Labor Fee" },
    {
      key: "line_total",
      label: "Line Total",
      render: (r) => <span className="font-semibold text-indigo-600">{r.line_total.toFixed(2)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Work Order Line Items"
        actions={
          <>
            <ExportDropdown data={data} filename="work-order-line-items" />
            <Button onClick={() => nav("/restringing")}>Back</Button>
          </>
        }
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <SearchBar placeholder="Search WO Code" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {!loading && data.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No line items found.</div>}
      <Table columns={cols} rows={data} onRowClick={(r) => nav(`/restringing/${r.work_order_id}`)} />
      <Pagination />
    </div>
  );
}
