import { pool } from "../db/pool.js";

export async function listAssetRents({
    search = "", 
    page = 1, 
    limit = 10, 
    sortBy = '',
    sortDir = "desc",
} = {}) {
    const offset = (Number(page) - 1) * Number(limit);

    const allowedSort = ["rent_code","created_at","member_id","hours","date","total_price","discounted_price","deposit","due"];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : "rent_code";
    const sortDirection = sortDir === "asc" ? "ASC" : "DESC";
    const searchParam = `%${search}%`;

    const countResult = await pool.query(
        `SELECT COUNT(*) as total
        FROM asset_rents ar
        JOIN users u ON u.id = ar.member_id
        WHERE ar.rent_code ILIKE $1 OR u.name ILIKE $1`,
        [searchParam],
    );

    const total = Number(countResult.rows[0].total);

    const { rows } = await pool.query(
        `
        SELECT ar.rent_code, ar.created_at, u.name AS member_name, 
        ar.hours, ar.date, ar.total_price,
        ar.discounted_price, ar.deposit, ar.due
        FROM asset_rents ar
        JOIN users u ON u.id = ar.member_id
        WHERE ar.rent_code ILIKE $1 OR u.name ILIKE $1
        ORDER BY ${sortColumn} ${sortDirection} NULLS LAST, u.id DESC
        LIMIT $2 OFFSET $3
        `,
        [searchParam, Number(limit), offset],
    );

    return {
        data: rows,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
    };
}

async function resolveAssetRentsId(rent_code) {
  const r = await pool.query("SELECT id FROM asset_rents WHERE rent_code = $1", [rent_code]);
  return r.rowCount > 0 ? r.rows[0].id : null;
}

export async function getAssetRents(idOrRentCode) {

    let id = idOrRentCode;
    if (typeof idOrRentCode === "string" && String(idOrRentCode).trim() !== "" && isNaN(Number(idOrRentCode))) {
        id = await resolveAssetRentsId(String(idOrRentCode).trim());
        if (id == null) return null;
    } else {
        id = Number(idOrRentCode);
    }
    const header = await pool.query (
        `SELECT ar.rent_code, ar.created_at, 
        u.name AS member_name, u.phone AS member_phone, t.name AS tiers_name,
        ar.hours, ar.date, ar.total_price,
        ar.discounted_price, ar.deposit, ar.due
        FROM asset_rents ar
        JOIN users u ON u.id = ar.member_id
        LEFT JOIN tiers t ON t.id = u.tier_id
        WHERE ar.id = $1`,
        [id],
    );
    if (header.rowCount === 0) return null;

    const lines = await pool.query (
       `SELECT ari.id, ari.created_at, ari.date, a.code, a.type, a.brand,
        ari.unit_price, ari.amount, ari.condition_out, ari.returned,
        ari.condition_in, ari.damage_fee, ari.extended_price
        FROM asset_rent_items ari
        JOIN asset_rents ar ON ar.id = ari.rent_id
        JOIN assets a ON a.id = ari.asset_id
        WHERE ari.rent_id = $1
        ORDER BY ari.id`, 
        [id],
    );
    return { header: header.rows[0], line_items: lines.rows };
}

//ADD SUMTIN ABOUT DISCOUNT HERE LATER
async function enrichLineItems(line_items) {
    return line_items.map((li) => {
        const returned = li.returned === true || li.returned === "true" || li.returned === 1;
        const extended_price = li.unit_price * li.amount;
        let damage_fee = 0;

        if (!returned) {
            damage_fee = li.unit_price * li.amount * 10;
        } else {
            if (li.condition_in === "damaged") damage_fee = li.unit_price * 0.5;
            else if (li.condition_in === "broken") damage_fee = li.unit_price;
            else damage_fee = 0;
        }

        return {
            ...li,
            returned,
            extended_price,
            damage_fee,
            condition_in: !returned ? "unknown" : (li.condition_in ?? "good"),
        };
    });
}
export async function createAssetRents({rent_code, member_id, hours, date, total_price, discounted_price, deposit, due, line_items}) {
    const client = await pool.connect();
    try {
        await client.query("begin");
        const enriched = await enrichLineItems(line_items);

        const id = member_id
        const cust = await client.query("SELECT id FROM users WHERE id = $1", [id]);
        if (cust.rowCount === 0) throw new Error(`Customer not found: ${id}`);
        const users_id = cust.rows[0].id;

        let resolvedRentCode = rent_code;
        if (!resolvedRentCode || String(resolvedRentCode).trim() === "") {
            const rentDate = date ? new Date(date) : new Date();
            const dateStr = rentDate.toISOString().slice(0, 10).replace(/-/g, "");

            const countRes = await client.query(
                `SELECT COUNT(*) as total FROM asset_rents WHERE date = $1`,
                [rentDate.toISOString().slice(0, 10)]
            );
            const seq = Number(countRes.rows[0].total) + 1;
            resolvedRentCode = `RI${dateStr}-${seq.toString().padStart(2, "0")}`;
        }

        const ar = await client.query (
            `INSERT INTO asset_rents(rent_code, member_id, hours, date, total_price, discounted_price, deposit, due)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [resolvedRentCode, users_id, hours, date || null, total_price, discounted_price ?? 0, deposit ?? 0, due ?? 0],
        );

        const rent_id = ar.rows[0].id;

        for (const li of enriched) {
            await client.query(
                `INSERT INTO asset_rent_items 
                (rent_id, date, asset_id, unit_price, amount, condition_out, returned, condition_in, damage_fee, extended_price)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    rent_id,
                    li.date || null,
                    Number(li.asset_id),
                    Number(li.unit_price),
                    Number(li.amount),
                    li.condition_out ?? "good",
                    li.returned ? 1 : 0,
                    li.condition_in ?? "good",
                    Number(li.damage_fee ?? 0),
                    Number(li.extended_price),
                ]
            );
        }

        await client.query("COMMIT");
        return ar.rows[0];

    } catch (err) {
        await client.query("rollback");
        throw err;
    } finally {
        client.release();
    }
}

export async function deleteAssetRents(idOrRentCode) {
    let id = idOrRentCode;
    if (typeof idOrRentCode === "string" && String(idOrRentCode).trim() !== "" && isNaN(Number(idOrRentCode))) {
        id = await resolveAssetRentsId(String(idOrRentCode).trim());
        if (id == null) return null;
    } else {
        id = Number(idOrRentCode);
    }
    await pool.query("DELETE from asset_rents where id=$1", [id]);
    return { ok: true };
}

export async function updateAssetRents(idOrRentCode, {rent_code, member_id, hours, date, total_price, discounted_price, deposit, due, line_items}) {
    let id = idOrRentCode;
        if (typeof idOrRentCode === "string" && String(idOrRentCode).trim() !== "" && isNaN(Number(idOrRentCode))) {
            id = await resolveAssetRentsId(String(idOrRentCode).trim());
            if (id == null) return null;
        } else {
            id = Number(idOrRentCode);
        }
    const client = await pool.connect();
    try {
        await client.query("begin");
        const enriched = await enrichLineItems(line_items);

        const memberId = member_id
        const cust = await client.query("SELECT id FROM users WHERE id = $1", [memberId]);
        if (cust.rowCount === 0) throw new Error(`Customer not found: ${memberId}`);
        const users_id = cust.rows[0].id;

        let resolvedRentCode = (rent_code != null && String(rent_code).trim() !== "") ? String(rent_code).trim() : null;
        if (resolvedRentCode === null) {
            const rentDate = date ? new Date(date) : new Date();
            const dateStr = rentDate.toISOString().slice(0, 10).replace(/-/g, "");

            const countRes = await client.query(
                `SELECT COUNT(*) as total FROM asset_rents WHERE date = $1`,
                [rentDate.toISOString().slice(0, 10)]
            );
            const seq = Number(countRes.rows[0].total) + 1;
            resolvedRentCode = `RI${dateStr}-${seq.toString().padStart(2, "0")}`;
        }

        const ar = await client.query (
            `UPDATE asset_rents 
            SET rent_code = $1, member_id = $2, hours = $3, date = $4, total_price = $5, discounted_price = $6, deposit = $7, due = $8
            WHERE id = $9
            RETURNING id`,
            [resolvedRentCode, users_id, hours, date || null, total_price, discounted_price, deposit, due, id],
        );

        const rent_id = ar.rows[0].id;

        for (const li of enriched) {
            await client.query(
                `UPDATE asset_rent_items 
                SET rent_id = $1, date = $2, asset_id = $3, unit_price = $4, amount = $5, condition_out = $6, returned = $7, 
                condition_in = $8, damage_fee = $9, extended_price = $10
                WHERE id = $11`,
                [
                    rent_id,
                    li.date || null,
                    Number(li.asset_id),
                    Number(li.unit_price),
                    Number(li.amount),
                    li.condition_out ?? "good",
                    li.returned ? 1 : 0,
                    li.condition_in ?? "good",
                    Number(li.damage_fee ?? 0),
                    Number(li.extended_price),
                    li.id,
                ]
            );
        }

        await client.query("COMMIT");
        const result = await pool.query("SELECT rent_code FROM asset_rents WHERE id = $1", [id]);
        return { rent_code: result.rows[0]?.rent_code };

    } catch (err) {
        await client.query("rollback");
        throw err;
    } finally {
        client.release();
    }
}


