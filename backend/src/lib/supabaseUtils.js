import { supabase } from "./supabase.js";

// Generic SELECT - GET all records with filters
export async function selectAll(table, filters = {}) {
  let query = supabase.from(table).select("*");

  for (const [key, value] of Object.entries(filters)) {
    if (value !== null && value !== undefined) {
      query = query.eq(key, value);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

// Generic SELECT - GET single record by id
export async function selectById(table, id) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Generic INSERT
export async function insert(table, record) {
  const { data, error } = await supabase
    .from(table)
    .insert([record])
    .select();

  if (error) throw new Error(error.message);
  return data[0];
}

// Generic UPDATE
export async function update(table, id, record) {
  const { data, error } = await supabase
    .from(table)
    .update(record)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
}

// Generic DELETE
export async function deleteRecord(table, id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

// Filter helper - converts query params to filter conditions
export function buildFilters(query, filterConfig) {
  const filters = {};

  for (const [param, dbField] of Object.entries(filterConfig)) {
    if (query[param]) {
      filters[dbField] = query[param];
    }
  }

  return filters;
}

// Search helper - does general fuzzy search
export async function search(table, searchFields, searchTerm) {
  let query = supabase.from(table).select("*");

  if (searchTerm && searchFields.length > 0) {
    // Supabase fuzzy search
    query = query.or(
      searchFields.map(field => `${field}.ilike.%${searchTerm}%`).join(",")
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

// Execute custom SQL query (for complex operations)
export async function executeQuery(sql, params = []) {
  const { data, error } = await supabase.rpc("execute_sql", {
    sql_query: sql,
    sql_params: params,
  });

  if (error) throw new Error(error.message);
  return data;
}

