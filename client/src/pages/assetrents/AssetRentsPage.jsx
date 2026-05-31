import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAssetRent, createAssetRent, updateAssetRent } from "../../api/assetrents.api.js";
import { getAsset } from "../../api/assets.api.js";

const emptyForm = {
    rent_code: "", member_id: "", hours: "", date: "",
    total_price: "", discounted_price: "", deposit: "", due: "",
};

const emptyLine = {
    asset_code: "", asset_id: "", asset_brand: "", date: "", unit_price: "", amount: "",
    extended_price: "", condition_out: "good", returned: true, condition_in: "good",
};

export default function AssetRentsPage({ mode }) {
    const { rent_code } = useParams();
    const nav = useNavigate();
    const [form, setForm] = React.useState(emptyForm);
    const [lines, setLines] = React.useState([]);

    React.useEffect(() => {
        if (mode !== "create") {
            getAssetRent(rent_code).then((res) => {
                setForm(res.data.header);
                setLines(res.data.line_items);
            });
        }
    }, [rent_code, mode]);

    React.useEffect(() => {
        const total = lines.reduce((sum, li) => sum + (Number(li.extended_price) || 0), 0);
        setForm((prev) => ({ ...prev, total_price: total }));
    }, [lines]);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleLineChange(i, e) {
        const { name } = e.target;
        // FIX: convert returned to actual boolean
        const value = name === "returned" ? e.target.value === "true" : e.target.value;

        setLines((prev) => {
            const updated = [...prev];
            updated[i] = { ...updated[i], [name]: value };
            if (name === "amount") {
                updated[i].extended_price = Number(updated[i].unit_price) * Number(value);
            }
            return updated;
        });

        if (name === "asset_code" && value) {
            try {
                const res = await getAsset(value);
                setLines((prev) => {
                    const updated = [...prev];
                    updated[i] = {
                        ...updated[i],
                        asset_id: res.data.id,
                        unit_price: res.data.price,
                        asset_brand: res.data.brand,
                        extended_price: res.data.price * (Number(updated[i].amount) || 1),
                    };
                    return updated;
                });
            } catch {
                // invalid code ignore
            }
        }
    }

    function addLine() {
        setLines((prev) => [...prev, { ...emptyLine }]);
    }

    function removeLine(i) {
        setLines((prev) => prev.filter((_, idx) => idx !== i));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const body = {
            ...form,
            member_id: Number(form.member_id),
            hours: Number(form.hours),
            total_price: Number(form.total_price),
            discounted_price: Number(form.discounted_price),
            deposit: Number(form.deposit) || 0,
            due: Number(form.due) || 0,
            line_items: lines.map((li) => ({
                ...li,
                asset_id: Number(li.asset_id),
                unit_price: Number(li.unit_price),
                amount: Number(li.amount),
                extended_price: Number(li.extended_price),
                returned: li.returned === true || li.returned === "true",
            })),
        };
        console.log("SENDING BODY:", JSON.stringify(body, null, 2));
        if (mode === "create") await createAssetRent(body);
        else await updateAssetRent(rent_code, body);
        nav("/assetrents");
    }

    const isView = mode === "view";

    return (
        <div>
            <h1>{mode === "create" ? "New Rent" : mode === "edit" ? "Edit Rent" : "View Rent"}</h1>
            <form onSubmit={handleSubmit}>
                <div><label>Rent Code</label><input name="rent_code" value={form.rent_code} onChange={handleChange} disabled={mode !== "create"} placeholder="Leave blank to auto-generate" /></div>
                <div><label>Member ID</label><input name="member_id" value={form.member_id} onChange={handleChange} disabled={isView} /></div>
                <div><label>Date</label><input name="date" type="date" value={form.date?.slice(0, 10) || ""} onChange={handleChange} disabled={isView} /></div>
                <div><label>Hours</label><input name="hours" type="number" value={form.hours} onChange={handleChange} disabled={isView} /></div>
                <div><label>Total Price</label><input name="total_price" type="number" value={form.total_price} disabled /></div>
                <div><label>Discounted Price</label><input name="discounted_price" type="number" value={form.discounted_price} onChange={handleChange} disabled={isView} /></div>
                <div><label>Deposit</label><input name="deposit" type="number" value={form.deposit} onChange={handleChange} disabled={isView} /></div>
                <div><label>Due</label><input name="due" type="number" value={form.due} onChange={handleChange} disabled={isView} /></div>

                <h3>Line Items</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Asset Code</th><th>Brand</th><th>Date</th><th>Unit Price</th>
                            <th>Amount</th><th>Extended</th><th>Condition Out</th>
                            <th>Returned</th><th>Condition In</th>
                            {!isView && <th>Remove</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map((li, i) => (
                            <tr key={i}>
                                <td><input name="asset_code" value={li.asset_code || ""} onChange={(e) => handleLineChange(i, e)} disabled={isView} /></td>
                                <td>{li.asset_brand || ""}</td>
                                <td><input name="date" type="date" value={li.date?.slice(0, 10) || ""} onChange={(e) => handleLineChange(i, e)} disabled={isView} /></td>
                                <td><input name="unit_price" type="number" value={li.unit_price || ""} disabled /></td>
                                <td><input name="amount" type="number" value={li.amount || ""} onChange={(e) => handleLineChange(i, e)} disabled={isView} /></td>
                                <td>{li.extended_price || ""}</td>
                                <td>
                                    <select name="condition_out" value={li.condition_out} onChange={(e) => handleLineChange(i, e)} disabled={isView}>
                                        <option value="good">Good</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="broken">Broken</option>
                                    </select>
                                </td>
                                <td>
                                    <select name="returned" value={String(li.returned)} onChange={(e) => handleLineChange(i, e)} disabled={isView}>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </td>
                                <td>
                                    <select name="condition_in" value={li.condition_in} onChange={(e) => handleLineChange(i, e)} disabled={isView}>
                                        <option value="good">Good</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="broken">Broken</option>
                                        <option value="unknown">Unknown</option>
                                    </select>
                                </td>
                                {!isView && <td><button type="button" onClick={() => removeLine(i)}>X</button></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!isView && <button type="button" onClick={addLine}>+ Add Line</button>}

                <br />
                {!isView && <button type="submit">{mode === "create" ? "Create" : "Save"}</button>}
                <button type="button" onClick={() => nav("/assetrents")}>Back</button>
            </form>
        </div>
    );
}