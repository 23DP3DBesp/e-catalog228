const { supabaseAdmin } = require('../config/supabaseClient');
const { formatProduct } = require('./product.service');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function dbError(error) {
  console.error('Database error:', error);
  return httpError(500, 'Database error');
}

// Full product objects, most recently added first
async function listFavorites(userId) {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('created_at, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('product_id', { ascending: false });
  if (error) throw dbError(error);
  return data.map((row) => formatProduct(row.products));
}

// Just the ids (enough to draw the heart icons on the catalog), same order as the list
async function listFavoriteIds(userId) {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('product_id', { ascending: false });
  if (error) throw dbError(error);
  return data.map((row) => row.product_id);
}

// Adding twice is fine (nothing changes the second time)
async function addFavorite(userId, productId) {
  const { error } = await supabaseAdmin
    .from('favorites')
    .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id', ignoreDuplicates: true });
  if (error) {
    if (error.code === '23503') throw httpError(404, 'Product not found'); // foreign key: no such product
    throw dbError(error);
  }
  return { productId, favorite: true };
}

// Removing something that isn't a favorite is fine too
async function removeFavorite(userId, productId) {
  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw dbError(error);
  return { productId, favorite: false };
}

module.exports = { listFavorites, listFavoriteIds, addFavorite, removeFavorite };