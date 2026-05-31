import React from "react";
import { useNavigate } from "react-router-dom";
import { listAssetRents, deleteAssetRent } from "../../api/assetrents.api.js";

export default function AssetRentsList() {
    const [data, setData] = React.useState([]);
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const nav = useNavigate();

    React.useEffect(() => {
        listAssetRents({ search, page, limit: 10 }).then((res) => {
            setData(res.data);
            setTotalPages(res.meta.totalPages);
        });
    }, [search, page]);

    async function handleDelete(rent_code) {
        if (!confirm("Delete this rent?")) return;
        await deleteAssetRent(rent_code);
        setData((prev) => prev.filter((r) => r.rent_code !== rent_code));
    }

    return (
        <div>
            <h1>Asset Rents</h1>
            <input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <button onClick={() => nav("/assetrents/new")}>+ New</button>
            <table>
                <thead>
                    <tr>
                        <th>Rent Code</th><th>Member</th><th>Date</th><th>Hours</th>
                        <th>Total</th><th>Discounted</th><th>Deposit</th><th>Due</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((r) => (
                        <tr key={r.rent_code}>
                            <td>{r.rent_code}</td>
                            <td>{r.member_name}</td>
                            <td>{r.date?.slice(0, 10)}</td>
                            <td>{r.hours}</td>
                            <td>{r.total_price}</td>
                            <td>{r.discounted_price}</td>
                            <td>{r.deposit}</td>
                            <td>{r.due}</td>
                            <td>
                                <button onClick={() => nav(`/assetrents/${encodeURIComponent(r.rent_code)}`)}>View</button>
                                <button onClick={() => nav(`/assetrents/${encodeURIComponent(r.rent_code)}/edit`)}>Edit</button>
                                <button onClick={() => handleDelete(r.rent_code)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                <span> Page {page} of {totalPages} </span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
        </div>
    );
}