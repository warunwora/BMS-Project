import { pool } from "../db/pool.js";

// tier_id: 1=Bronze 2=Silver 3=Gold 4=Premium(Gold)
const TIER_DISCOUNT  = { 1: 0.05, 2: 0.07, 3: 0.10, 4: 0.10 };
const TIER_MULT      = { 1: 1.05, 2: 1.10, 3: 1.70, 4: 1.70 };

export async function getMemberTier(member_id) {
  if (!member_id) return { tier_id: 1, discount: 0.05, multiplier: 1.05 };
  const { rows } = await pool.query("SELECT tier_id FROM member WHERE id = $1", [member_id]);
  const tid = rows[0]?.tier_id ?? 1;
  return {
    tier_id: tid,
    discount:    TIER_DISCOUNT[tid]  ?? 0.05,
    multiplier:  TIER_MULT[tid]      ?? 1.05,
  };
}

export function calcPoints(net_amount, multiplier) {
  return Math.floor(parseFloat(net_amount || 0) * multiplier);
}

export function calcDiscount(subtotal, discount_rate) {
  return Math.round(parseFloat(subtotal || 0) * discount_rate * 100) / 100;
}

export function calcNet(subtotal, discount) {
  return Math.round((parseFloat(subtotal || 0) - parseFloat(discount || 0)) * 100) / 100;
}
