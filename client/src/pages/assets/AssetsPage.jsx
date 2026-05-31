import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAsset, createAsset, updateAsset } from "../../api/assets.api.js";

export default function AssetFormPage({ mode }) {
    const { code } = useParams();
    const nav = useNavigate();
    const [form, setForm] = React.useState({ code: "", type: "", brand: "", purchase_date: "", price: "" });

    React.useEffect(() => {
        if (mode !== "create") {
            getAsset(code).then((res) => setForm(res.data));
        }
    }, [code, mode]);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (mode === "create") await createAsset(form);
        else await updateAsset(code, form);
        nav("/assets");
    }

    const isView = mode === "view";

    return (
        <div>
            <h1>{mode === "create" ? "New Asset" : mode === "edit" ? "Edit Asset" : "View Asset"}</h1>
            <form onSubmit={handleSubmit}>
                <div><label>Code</label><input name="code" value={form.code} onChange={handleChange} disabled={mode !== "create"} /></div>
                <div><label>Type</label><input name="type" value={form.type} onChange={handleChange} disabled={isView} /></div>
                <div><label>Brand</label><input name="brand" value={form.brand} onChange={handleChange} disabled={isView} /></div>
                <div><label>Purchase Date</label><input name="purchase_date" type="date" value={form.purchase_date?.slice(0, 10) || ""} onChange={handleChange} disabled={isView} /></div>
                <div><label>Price</label><input name="price" type="number" value={form.price} onChange={handleChange} disabled={isView} /></div>
                {!isView && <button type="submit">{mode === "create" ? "Create" : "Save"}</button>}
                <button type="button" onClick={() => nav("/assets")}>Back</button>
            </form>
        </div>
    );
}