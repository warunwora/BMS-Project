import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Button, DateRangePicker, ExportDropdown, Table } from "../../components/ui";
import { useToast } from "../../contexts/toast";
import { get } from "../../lib/api";

export default function RevenueByServiceType() {
  const nav = useNavigate();
  const toast = useToast();
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    get("/work-orders/report/revenue-by-service", {
      from: dateRange.from || "",
      to: dateRange.to || "",
    })
      .then(setData)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [dateRange]);

  // Calculate grand total
  const grandTotal = data.reduce((sum, row) => sum + (row.revenue || 0), 0);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value || 0);
  };

  const cols = [
    { key: "service_name", label: "Service Type" },
    {
      key: "count",
      label: "Item Count",
      render: (r) => r.count || 0,
    },
    {
      key: "total_material",
      label: "Material Cost",
      render: (r) => formatCurrency(r.total_material),
    },
    {
      key: "total_labor",
      label: "Labor Cost",
      render: (r) => formatCurrency(r.total_labor),
    },
    {
      key: "revenue",
      label: "Total Revenue",
      render: (r) => formatCurrency(r.revenue),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Report: Revenue by Service Type"
        actions={
          <div className="flex gap-3 items-center">
            <DateRangePicker from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
            <ExportDropdown
              data={[
                ...data.map((r) => ({
                  "Service Type": r.service_name,
                  "Item Count": r.count,
                  "Material Cost": r.total_material,
                  "Labor Cost": r.total_labor,
                  "Total Revenue": r.revenue,
                })),
                {
                  "Service Type": "GRAND TOTAL",
                  "Item Count": data.reduce((sum, r) => sum + (r.count || 0), 0),
                  "Material Cost": data.reduce((sum, r) => sum + (r.total_material || 0), 0),
                  "Labor Cost": data.reduce((sum, r) => sum + (r.total_labor || 0), 0),
                  "Total Revenue": grandTotal,
                },
              ]}
              filename="revenue-by-service-type"
            />
            <Button onClick={() => nav(-1)}>Back</Button>
          </div>
        }
      />

      {loading && <div className="py-8 text-center text-sm text-slate-400">Loading...</div>}
      {!loading && data.length === 0 && (
        <div className="py-8 text-center text-sm text-slate-400">No data found for the selected date range.</div>
      )}

      <div className="mb-4">
        <Table columns={cols} rows={data} />
      </div>

      {data.length > 0 && (
        <div className="border-t border-slate-200 pt-4 mt-4">
          <div className="flex justify-end gap-8 font-semibold text-sm">
            <div>
              <span className="text-slate-600">Grand Total Revenue:</span>
              <span className="ml-2 text-lg text-slate-900">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
