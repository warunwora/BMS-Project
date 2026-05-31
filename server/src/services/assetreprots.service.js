import { pool } from "../db/pool.js";

// REPORT 1 — Damage fee by asset type in date range (with TOTAL row)
export async function reportDamageSummary({ date_from, date_to }) {
    const { rows } = await pool.query(
        `WITH asset_summary AS (
            SELECT
                a.type AS asset_type,
                COUNT(*) FILTER (WHERE ari.damage_fee <> 0) AS count,
                SUM(ari.damage_fee) AS damage_fee
            FROM asset_rent_items ari
            JOIN assets a ON a.id = ari.asset_id
            JOIN asset_rents ar ON ar.id = ari.rent_id
            WHERE ar.date >= $1
              AND ar.date < $2::date + interval '1 day'
            GROUP BY a.type
        )
        SELECT asset_type, count, damage_fee
        FROM (
            SELECT asset_type, count, damage_fee, 0 AS sort_order FROM asset_summary
            UNION ALL
            SELECT 'TOTAL', SUM(count), SUM(damage_fee), 1 FROM asset_summary
        ) t
        ORDER BY sort_order, asset_type`,
        [date_from, date_to]
    );
    return rows;
}

// REPORT 2 — Rental receipt by tier (filter by tier name, * = all)
export async function reportRentalReceipt({ tier_name }) {
    const { rows } = await pool.query(
        `SELECT
            ar.rent_code AS "Rent Code",
            u.name AS "Customer Name",
            t.name AS "Rank",
            ar.deposit AS "Deposit",
            a.code AS "Asset Code",
            a.type AS "Asset Type",
            a.brand AS "Asset Brand",
            ari.amount AS "Quantity"
        FROM asset_rent_items ari
        JOIN assets a ON a.id = ari.asset_id
        JOIN asset_rents ar ON ar.id = ari.rent_id
        JOIN users u ON u.id = ar.member_id
        JOIN tiers t ON t.id = u.tier_id
        WHERE ($1 = '*' OR t.name = $1)
        ORDER BY ar.rent_code`,
        [tier_name ?? '*']
    );
    return rows;
}

// REPORT 3 — Unreturned equipment (filter by asset code, * = all)
export async function reportUnreturned({ asset_code }) {
    const { rows } = await pool.query(
        `SELECT
            ar.rent_code AS "Rent Code",
            a.code AS "Asset Code",
            a.type AS "Asset Type",
            a.brand AS "Asset Brand",
            ari.amount AS "Quantity"
        FROM asset_rent_items ari
        JOIN assets a ON a.id = ari.asset_id
        JOIN asset_rents ar ON ar.id = ari.rent_id
        WHERE ($1 = '*' OR a.code = $1)
        AND ari.returned = 0`,
        [asset_code ?? '*']
    );
    return rows;
}

// REPORT 4 — Total damage fee by asset type in date range
export async function reportDamageByType({ date_from, date_to }) {
    const { rows } = await pool.query(
        `SELECT
            a.type AS "Asset Type",
            SUM(ari.damage_fee) AS "Damage Fee"
        FROM asset_rent_items ari
        JOIN assets a ON a.id = ari.asset_id
        JOIN asset_rents ar ON ar.id = ari.rent_id
        WHERE ar.date >= $1
          AND ar.date < $2::date + interval '1 day'
        GROUP BY a.type`,
        [date_from, date_to]
    );
    return rows;
}