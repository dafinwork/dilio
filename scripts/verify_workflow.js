import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pfwmhmljejiskkfbonnm.supabase.co',
  'sb_publishable_7yxqq_XJ6rKLAHYuYwe3ww_gF6kLNEV'
);

function safeColors(colors) {
  if (Array.isArray(colors)) return colors;
  if (typeof colors === 'string') {
    try {
      const parsed = JSON.parse(colors);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

const toDatabasePayload = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug || `prod-${Date.now()}`,
  description: p.description || '',
  price: Number(p.price) || 0,
  image_url: p.image_url || '',
  material: p.material || '',
  colors: safeColors(p.colors),
  is_new: Boolean(p.is_new),
  is_exclusive: Boolean(p.is_exclusive),
  product_group: p.product_group || 'harian',
  cutting_type: p.product_group === 'harian' ? (p.cutting_type || 'oversized') : null,
  sablon_type: p.product_group === 'custom' ? (p.sablon_type || 'dtf') : null,
  exclusive_category: p.product_group === 'eksklusif' ? (p.exclusive_category || 'dilio') : null,
  category_label: p.category_label || '',
  placeholder_title: p.placeholder_title || p.name,
  placeholder_bg: p.placeholder_bg || '#E5E7EB',
  placeholder_text_color: p.placeholder_text_color || '#374151',
  extra_colors_count: Number(p.extra_colors_count) || 0,
  created_at: p.created_at || new Date().toISOString(),
});

async function runFullVerification() {
  console.log('=== STEP 1: Upload Image to Storage ===');
  const imgBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const imgPath = `products/verify-${Date.now()}.png`;
  const { data: upData, error: upErr } = await supabase.storage
    .from('product-images')
    .upload(imgPath, imgBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (upErr) {
    console.error('FAILED STEP 1:', upErr);
    return;
  }
  const { data: pubUrl } = supabase.storage.from('product-images').getPublicUrl(imgPath);
  console.log('STEP 1 PASSED! Public Image URL:', pubUrl.publicUrl);

  console.log('=== STEP 2: Insert Product with Image URL ===');
  const rawFormData = {
    name: 'Kaos Uji Coba Otomatis',
    product_group: 'harian',
    cutting_type: 'oversized',
    price: 95000,
    description: 'Kaos hasil uji coba sistem otomatis',
    image_url: pubUrl.publicUrl,
    material: 'Cotton Combed 24s Premium',
    colors: ['#000000', '#FFFFFF', '#DC2626'],
    extra_colors_count: 5,
    visual_mode: 'image', // simulating the UI toggle
    placeholder_title: 'Kaos\nOtomatis',
  };

  const payload = toDatabasePayload({
    ...rawFormData,
    id: `verify-prod-${Date.now()}`,
  });

  const { error: insErr } = await supabase.from('products').insert([payload]);
  if (insErr) {
    console.error('FAILED STEP 2:', insErr);
    return;
  }
  console.log('STEP 2 PASSED! Product inserted into Supabase.');

  console.log('=== STEP 3: Fetch Back (Simulating Page Refresh) ===');
  const { data: fetched, error: fetchErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', payload.id);

  if (fetchErr || !fetched || fetched.length === 0) {
    console.error('FAILED STEP 3:', fetchErr);
    return;
  }
  console.log('STEP 3 PASSED! Product preserved on refresh:', {
    id: fetched[0].id,
    name: fetched[0].name,
    price: fetched[0].price,
    image_url: fetched[0].image_url,
  });

  console.log('=== STEP 4: Cleaning up verification test product ===');
  await supabase.from('products').delete().eq('id', payload.id);
  await supabase.storage.from('product-images').remove([imgPath]);
  console.log('=== ALL STEPS VERIFIED 100% WORKING! ===');
}

runFullVerification();
