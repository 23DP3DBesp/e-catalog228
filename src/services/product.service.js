const { supabaseAdmin } = require('../config/supabaseClient');

const DEFAULT_LIMIT = 12;

// [column, ascending] pairs; id is always the tie-breaker (same as the frontend)
const SORTS = {
  featured: [['id', true]],
  'price-low': [['base_price', true], ['id', true]],
  'price-high': [['base_price', false], ['id', true]],
  brand: [['brand', true], ['id', true]],
  popular: [['popularity', false], ['id', true]],
};

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function dbError(error) {
  console.error('Database error:', error);
  return httpError(500, 'Database error');
}

// DB row -> the shape the frontend already uses
function formatProduct(row) {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    size: row.size,
    width: row.width,
    profile: row.profile,
    diameter: row.diameter,
    loadIndex: row.load_index,
    speedIndex: row.speed_index,
    season: row.season,
    studded: row.studded,
    fuel: row.fuel_grade,
    wet: row.wet_grade,
    noise: row.noise_db,
    markings: row.markings,
    price: Number(row.base_price),
    popularity: row.popularity,
    available: row.available,
    image: row.image_url,
  };
}

function formatOffer(row) {
  const shipping = { type: row.shipping_type, amount: row.shipping_amount === null ? null : Number(row.shipping_amount) };
  if (row.free_from_quantity !== null) shipping.quantity = row.free_from_quantity;
  return {
    id: row.id,
    merchantId: row.merchant_id,
    merchant: row.merchants?.name ?? null,
    price: Number(row.price),
    availability: row.availability_note,
    available: row.available,
    shipping,
  };
}

function applyFilters(query, filters) {
  // every word must match brand, model or size
  for (const word of (filters.q || '').split(/\s+/)) {
    const token = word.replace(/[,()"\\%*]/g, '');
    if (token) query = query.or(`brand.ilike.*${token}*,model.ilike.*${token}*,size.ilike.*${token}*`);
  }

  if (filters.season) query = query.eq('season', filters.season);
  for (const key of ['width', 'profile', 'diameter']) {
    if (filters[key] !== undefined) query = query.eq(key, filters[key]);
  }
  if (filters.brand?.length) query = query.in('brand', filters.brand);
  if (filters.maxPrice !== undefined) query = query.lte('base_price', filters.maxPrice);
  if (filters.load) query = query.eq('load_index', filters.load);
  if (filters.speed) query = query.eq('speed_index', filters.speed);
  if (filters.fuel) query = query.eq('fuel_grade', filters.fuel);
  if (filters.wet) query = query.eq('wet_grade', filters.wet);
  if (filters.noise !== undefined) query = query.lte('noise_db', filters.noise); // null noise is excluded
  if (filters.available) query = query.eq('available', true);
  if (filters.studs) query = query.eq('season', 'winter').eq('studded', filters.studs === 'yes');
  if (filters.marking) query = query.contains('markings', [filters.marking]);
  return query;
}

async function listProducts(filters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? DEFAULT_LIMIT;

  let query = applyFilters(supabaseAdmin.from('products').select('*', { count: 'exact' }), filters);
  for (const [column, ascending] of SORTS[filters.sort || 'featured']) {
    query = query.order(column, { ascending });
  }

  const from = (page - 1) * limit;
  let { data, count, error } = await query.range(from, from + limit - 1);

  // Asking for a page past the end: PostgREST answers with an error, we answer with an empty page
  if (error?.code === 'PGRST103') {
    const result = await applyFilters(
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
      filters,
    );
    if (result.error) throw dbError(result.error);
    data = [];
    count = result.count;
    error = null;
  }
  if (error) throw dbError(error);

  return {
    items: data.map(formatProduct),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

async function getProductRow(id) {
  const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw dbError(error);
  if (!data) throw httpError(404, 'Product not found');
  return data;
}

async function getOffers(productId) {
  const { data, error } = await supabaseAdmin
    .from('offers')
    .select('*, merchants(name)')
    .eq('product_id', productId)
    .order('id');
  if (error) throw dbError(error);
  return data.map(formatOffer);
}

async function getProduct(id) {
  const row = await getProductRow(id);
  return { ...formatProduct(row), offers: await getOffers(id) };
}

async function getProductOffers(id) {
  await getProductRow(id); // 404 if the product doesn't exist
  return getOffers(id);
}

// Values for the filter panel
async function getFacets() {
  const { data, error } = await supabaseAdmin.from('products').select('brand, width, profile, diameter');
  if (error) throw dbError(error);
  const unique = (values) => [...new Set(values)];
  const numeric = (values) => unique(values).sort((a, b) => a - b);
  return {
    brands: unique(data.map((p) => p.brand)).sort((a, b) => a.localeCompare(b)),
    widths: numeric(data.map((p) => p.width)),
    profiles: numeric(data.map((p) => p.profile)),
    diameters: numeric(data.map((p) => p.diameter)),
  };
}

module.exports = { listProducts, getProduct, getProductOffers, getFacets, formatProduct };