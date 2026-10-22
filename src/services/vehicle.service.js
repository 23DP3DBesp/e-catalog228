const { supabaseAdmin } = require('../config/supabaseClient');

function dbError(error) {
  console.error('Database error:', error);
  const err = new Error('Database error');
  err.status = 500;
  return err;
}

const unique = (values) => [...new Set(values)];
const byText = (a, b) => a.localeCompare(b);

async function listBrands() {
  const { data, error } = await supabaseAdmin.from('vehicles').select('brand');
  if (error) throw dbError(error);
  return unique(data.map((v) => v.brand)).sort(byText);
}

async function listModels(brand) {
  const { data, error } = await supabaseAdmin.from('vehicles').select('model').eq('brand', brand);
  if (error) throw dbError(error);
  return unique(data.map((v) => v.model)).sort(byText);
}

// newest first
async function listYears(brand, model) {
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .select('year')
    .eq('brand', brand)
    .eq('model', model);
  if (error) throw dbError(error);
  return unique(data.map((v) => v.year)).sort((a, b) => b - a);
}

// Last step of the picker: each modification comes with its tire size
async function listModifications(brand, model, year) {
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .select('id, modification, size')
    .eq('brand', brand)
    .eq('model', model)
    .eq('year', year)
    .order('modification');
  if (error) throw dbError(error);
  return data;
}

module.exports = { listBrands, listModels, listYears, listModifications };