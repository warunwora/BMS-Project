import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

async function getTierByName(name) {
  const { data } = await supabase.from("tier").select("id").eq("name", name).single();
  return data?.id ?? null;
}

function norm(m) {
  return {
    ...m,
    email: m.email ?? m.mail ?? "",
    points: m.points ?? m.current_reward_point ?? 0,
    lifetime_points: m.lifetime_points ?? m["lifetime_point"] ?? 0,
    gender: m.gender === "M" ? "Male" : m.gender === "F" ? "Female" : (m.gender ?? "Male"),
    tier_id: m.tier_id ?? 1,
    tier_name: m.tier?.name ?? "Bronze",
  };
}

async function denorm(body) {
  const { email, points, lifetime_points, gender, tier_id, id, ...rest } = body;

  let resolvedTierId = tier_id;
  if (typeof tier_id === "string") {
    const found = await getTierByName(tier_id);
    if (found !== null) resolvedTierId = found;
  }

  return {
    ...rest,
    mail: email ?? rest.mail,
    current_reward_point: points != null ? points : rest.current_reward_point,
    "lifetime_point": lifetime_points != null ? lifetime_points : rest["lifetime_point"],
    gender: gender === "Male" ? "M" : gender === "Female" ? "F" : gender,
    tier_id: resolvedTierId,
  };
}

router.get("/", async (req, res) => {
  try {
    const { search, tier } = req.query;
    let query = supabase.from("member").select("*, tier(*)");

    if (search) {
      const num = parseInt(search);
      const orFilter = `name.ilike.%${search}%,phone.ilike.%${search}%,mail.ilike.%${search}%`;
      query = isNaN(num) ? query.or(orFilter) : query.or(`${orFilter},id.eq.${num}`);
    }
    if (tier) {
      const tierNum = await getTierByName(tier);
      query = query.eq("tier_id", tierNum ?? tier);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json((data ?? []).map(norm));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("member")
      .select("*, tier(*)")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(norm(data));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { data: last } = await supabase
      .from("member")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
    const nextId = ((last?.[0]?.id) ?? 0) + 1;

    const { data, error } = await supabase
      .from("member")
      .insert([{ id: nextId, ...await denorm(req.body) }])
      .select();

    if (error) throw error;
    res.status(201).json(norm(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("member")
      .update(await denorm(req.body))
      .eq("id", req.params.id)
      .select();

    if (error) throw error;
    res.json(norm(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("member").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;