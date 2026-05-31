import React from "react";
import { useNavigate } from "react-router-dom";
import { listAssets, deleteAsset } from "../../api/assets.api.js";

export default function AssetListPage() {
    const [data, setData] = React.useState([]);
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const nav = useNavigate();

    React.useEffect(() => {
        listAssets({ search, page, limit: 10 }).then((res) => {
            setData(res.data);
            setTotalPages(res.meta.totalPages);
        });
    }, [search, page]);

    async function handleDelete(code) {
        if (!confirm("Delete this asset?")) return;
        await deleteAsset(code);
        setData((prev) => prev.filter((a) => a.code !== code));
    }

    return (
        <div>
            <h1>Assets</h1>
            <input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <button onClick={() => nav("/assets/new")}>+ New</button>
            <table>
                <thead>
                    <tr>
                        <th>Code</th><th>Type</th><th>Brand</th><th>Purchase Date</th><th>Price</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((a) => (
                        <tr key={a.code}>
                            <td>{a.code}</td>
                            <td>{a.type}</td>
                            <td>{a.brand}</td>
                            <td>{a.purchase_date?.slice(0, 10)}</td>
                            <td>{a.price}</td>
                            <td>
                                <button onClick={() => nav(`/assets/${a.code}`)}>View</button>
                                <button onClick={() => nav(`/assets/${a.code}/edit`)}>Edit</button>
                                <button onClick={() => handleDelete(a.code)}>Delete</button>
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