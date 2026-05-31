import { pool } from "../db/pool.js";

export async function listAssets({search = "", page = 1, limit = 10,} = {}) {
    const offset = (Number(page) - 1) * Number(limit);
    // const allowedSort = ["code", "type", "brand", "purchase_date", "price"];
    // const sortColumn = allowedSort.includes(sortBy) ? sortBy : "purchase_date";
    // const sortDirection = sortDir === "asc" ? "ASC" : "DESC";
    const searchParam = `%${search}%`;

    const countResult = await pool.query (
        `SELECT COUNT(*) AS total
        FROM assets 
        WHERE code ILIKE $1 OR type ILIKE $1 OR brand ILIKE $1`,
        [searchParam],
    );

    const total = Number(countResult.rows[0].total);

    const { rows } = await pool.query (
        `SELECT id, code, type, brand, purchase_date, price
        FROM assets
        WHERE code ILIKE $1 OR type ILIKE $1 OR brand ILIKE $1
        ORDER BY code ASC
        LIMIT $2 OFFSET $3`,
        [searchParam, Number(limit), offset],
    );

    return {
        data: rows,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total/Number(limit)),
    };
}

export async function createAssets({code, type, brand, purchase_date, price}) {
    const {rows} = await pool.query (
        `INSERT INTO assets (code, type, brand, purchase_date, price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, code, type, brand, purchase_date, price`,
        [code, type, brand, purchase_date, price],
    );
    return rows[0];
}

export async function getAssets(code) {
    const{rows} = await pool.query (
        `SELECT id, code, type, brand, purchase_date, price from assets WHERE code = $1`,
        [code],
    );
    return rows[0] ?? null;
}

export async function updateAssets(code, {type, brand, purchase_date, price}) {
    const result = await pool.query (
        `UPDATE assets SET type = $1, brand = $2, purchase_date = $3, price = $4
        WHERE code = $5`
        ,[type, brand, purchase_date, price, code],
    );
    return result.rowCount > 0 ? { ok: true } : null;
}

export async function deleteAssets(code) {
    const result = await pool.query (
        `DELETE from assets WHERE code = $1`, [code],
    );
    return result.rowCount > 0 ? { ok: true } : null;
}

export async function getAssetByCode(code) {
    const { rows } = await pool.query(`SELECT * FROM assets WHERE code = $1`, [code]);
    return rows[0] ?? null;
}