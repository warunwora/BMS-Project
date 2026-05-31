import React from "react";
import { reportDamageSummary, reportRentalReceipt, reportUnreturned, reportDamageByType } from "../../api/assetreports.api.js";

export default function ReportsPage() {
    const [activeReport, setActiveReport] = React.useState(null);
    const [results, setResults] = React.useState([]);
    const [params, setParams] = React.useState({});

    const reports = [
        { key: "damage-summary", label: "Damage Summary by Type", fields: ["date_from", "date_to"], fn: reportDamageSummary },
        { key: "rental-receipt", label: "Rental Receipt by Tier", fields: ["tier_name"], fn: reportRentalReceipt },
        { key: "unreturned", label: "Unreturned Equipment", fields: ["asset_code"], fn: reportUnreturned },
        { key: "damage-by-type", label: "Damage Fee by Asset Type", fields: ["date_from", "date_to"], fn: reportDamageByType },
    ];

    async function handleRun(report) {
        setActiveReport(report.key);
        const res = await report.fn(params);
        setResults(res.data);
    }

    return (
        <div>
            <h1>Reports</h1>
            <div>
                {reports.map((r) => (
                    <div key={r.key} style={{ marginBottom: "2rem", border: "1px solid #ccc", padding: "1rem" }}>
                        <h3>{r.label}</h3>
                        {r.fields.map((f) => (
                            <div key={f}>
                                <label>{f}: </label>
                                <input
                                    type={f.includes("date") ? "date" : "text"}
                                    placeholder={f === "tier_name" || f === "asset_code" ? "* for all" : ""}
                                    onChange={(e) => setParams((prev) => ({ ...prev, [f]: e.target.value }))}
                                />
                            </div>
                        ))}
                        <button onClick={() => handleRun(r)}>Run</button>
                    </div>
                ))}
            </div>

            {activeReport && results.length > 0 && (
                <div>
                    <h2>Results</h2>
                    <table>
                        <thead>
                            <tr>{Object.keys(results[0]).map((k) => <th key={k}>{k}</th>)}</tr>
                        </thead>
                        <tbody>
                            {results.map((row, i) => (
                                <tr key={i}>{Object.values(row).map((v, j) => <td key={j}>{v}</td>)}</tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}