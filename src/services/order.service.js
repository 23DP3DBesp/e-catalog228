const { supabaseAdmin } = require('../config/supabaseClient');

const MAX_LINE_QUANTITY = 20;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function dbError(error) {
  console.error('Database error:', error);
  return httpError(500, 'Database error');
}

// Money is calculated in cents (whole numbers) to avoid floating point errors
const toCents = (value) => Math.round(Number(value) * 100);
const toEuros = (cents) => cents / 100;

// Same rules as the frontend's utils/orderTotals.js. Returns null if unknown.
function shippingCents(offer, quantity) {
  if (offer.shipping_type === 'unknown' || offer.shipping_amount === null) return null;
  if (offer.shipping_type === 'free-from-quantity' && quantity >= offer.free_from_quantity) return 0;
  return toCents(offer.shipping_amount);
}

function formatOrder(row) {
  return {
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    currency: 'EUR',
    customer: {
      fullName: row.full_name,
      phone: row.phone,
      address: row.address,
      city: row.city,
      postalCode: row.postal_code,
    },
    items: row.order_items.map((item) => ({
      productId: item.product_id,
      offerId: item.offer_id,
      brand: item.brand,
      model: item.model,
      size: item.size,
      merchantId: item.merchant_id,
      merchant: item.merchant_name,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      lineTotal: Number(item.line_total),
    })),
    shipping: row.shipping_breakdown,
    productsTotal: Number(row.products_total),
    shippingTotal: Number(row.shipping_total),
    total: Number(row.total),
  };
}

async function createOrder(userId, { items, customer }) {
  // The same offer listed twice becomes one line
  const quantities = new Map();
  for (const { offerId, quantity } of items) {
    quantities.set(offerId, (quantities.get(offerId) || 0) + quantity);
  }
  for (const [offerId, quantity] of quantities) {
    if (quantity > MAX_LINE_QUANTITY) {
      throw httpError(422, `Quantity for offer ${offerId} is too high (max ${MAX_LINE_QUANTITY})`);
    }
  }

  // Prices always come from the database, never from the client
  const { data: offers, error } = await supabaseAdmin
    .from('offers')
    .select(
      'id, product_id, merchant_id, price, available, shipping_type, shipping_amount, free_from_quantity, merchants(name), products(brand, model, size)',
    )
    .in('id', [...quantities.keys()]);
  if (error) throw dbError(error);
  const offersById = new Map(offers.map((offer) => [offer.id, offer]));

  const lines = [];
  for (const [offerId, quantity] of quantities) {
    const offer = offersById.get(offerId);
    if (!offer) throw httpError(422, `Offer ${offerId} does not exist`);
    if (!offer.available) {
      throw httpError(409, `Offer ${offerId} (${offer.products.brand} ${offer.products.model}) is not available`);
    }
    const unitCents = toCents(offer.price);
    lines.push({ offer, quantity, unitCents, lineCents: unitCents * quantity });
  }

  // Shipping is charged once per merchant, based on how many tires you buy from them
  const merchants = new Map();
  for (const { offer, quantity } of lines) {
    const group = merchants.get(offer.merchant_id);
    if (group) group.quantity += quantity;
    else merchants.set(offer.merchant_id, { offer, merchant: offer.merchants.name, quantity });
  }
  const shipping = [];
  let shippingTotalCents = 0;
  for (const [merchantId, group] of merchants) {
    const cost = shippingCents(group.offer, group.quantity);
    if (cost === null) {
      throw httpError(409, `Shipping cost from ${group.merchant} is unknown, so this order cannot be placed`);
    }
    shippingTotalCents += cost;
    shipping.push({ merchantId, merchant: group.merchant, quantity: group.quantity, cost: toEuros(cost) });
  }

  const productsTotalCents = lines.reduce((sum, line) => sum + line.lineCents, 0);

  const { data: orderId, error: rpcError } = await supabaseAdmin.rpc('create_order', {
    p_user_id: userId,
    p_customer: customer,
    p_items: lines.map(({ offer, quantity, unitCents, lineCents }) => ({
      product_id: offer.product_id,
      offer_id: offer.id,
      brand: offer.products.brand,
      model: offer.products.model,
      size: offer.products.size,
      merchant_id: offer.merchant_id,
      merchant_name: offer.merchants.name,
      unit_price: toEuros(unitCents),
      quantity,
      line_total: toEuros(lineCents),
    })),
    p_shipping: shipping,
    p_products_total: toEuros(productsTotalCents),
    p_shipping_total: toEuros(shippingTotalCents),
    p_total: toEuros(productsTotalCents + shippingTotalCents),
  });
  if (rpcError) throw dbError(rpcError);

  return getOrder(orderId, { id: userId });
}

async function listOrders(userId) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, status, created_at, products_total, shipping_total, total, order_items(quantity)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(100);
  if (error) throw dbError(error);

  return data.map((row) => ({
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    itemCount: row.order_items.reduce((sum, item) => sum + item.quantity, 0),
    productsTotal: Number(row.products_total),
    shippingTotal: Number(row.shipping_total),
    total: Number(row.total),
  }));
}

// Owners can read their own order, admins can read any. Anyone else gets a 404
// (not a 403), so order numbers can't be probed.
async function getOrder(orderId, user) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .order('id', { referencedTable: 'order_items' })
    .maybeSingle();
  if (error) throw dbError(error);

  const isAdmin = user.app_metadata?.role === 'admin';
  if (!data || (data.user_id !== user.id && !isAdmin)) throw httpError(404, 'Order not found');
  return formatOrder(data);
}

module.exports = { createOrder, listOrders, getOrder };