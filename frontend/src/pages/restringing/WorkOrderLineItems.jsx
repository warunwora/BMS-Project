import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Button, SearchBar, FilterDropdown, Table, Pagination, ExportDropdown } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get } from "../../lib/api";

export default function WorkOrderLineItems() {
  const nav = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [racketFilter, setRacketFilter] = useState("");
  const [data, setData] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [rackets, setRackets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all line items
  function load() {
    setLoading(true);
    get("/work-orders/line-items", {
      search,
      service_id: serviceFilter || undefined,
      product_id: productFilter || undefined,
      racket_id: racketFilter || undefined,
    })
      .then((items) => {
        setData(items);
        
        // Extract unique values for filters
        const uniqueServices = [...new Map(items.map(item => [item.service_id, { id: item.service_id, name: item.service_name }])).values()];
        const uniqueProducts = [...new Map(items.map(item => [item.product_id, { id: item.product_id, code: item.product_code, name: item.product_name }])).values()];
        const uniqueRackets = [...new Map(items.map(item => [item.racket_model_product_id, { id: item.racket_model_product_id, code: item.racket_code, name: item.racket_name }])).values()];
        
        setServices(uniqueServices.filter(s => s.id));
        setProducts(uniqueProducts.filter(p => p.id));
        setRackets(uniqueRackets.filter(r => r.id));
      })
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search, serviceFilter, productFilter, racketFilter]);

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
            <Button onClick={() => nav("/restringing")}>Back to Work Orders</Button>
          </>
        }
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <SearchBar placeholder="Search WO Code" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterDropdown
          label="Service Type"
          options={services.map((s) => ({ id: s.id, label: s.name }))}
          value={serviceFilter}
          onChange={setServiceFilter}
        />
        <FilterDropdown
          label="Product"
          options={products.map((p) => ({ id: p.id, label: `${p.name} (${p.code})` }))}
          value={productFilter}
          onChange={setProductFilter}
        />
        <FilterDropdown
          label="Racket"
          options={rackets.map((r) => ({ id: r.id, label: `${r.name} (${r.code})` }))}
          value={racketFilter}
          onChange={setRacketFilter}
        />
      </div>

      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {!loading && data.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No line items found.</div>}
      <Table columns={cols} rows={data} onRowClick={(r) => nav(`/restringing/${r.work_order_id}`)} />
      <Pagination />
    </div>
  );
}
