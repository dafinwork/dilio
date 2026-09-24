/**
 * Formats a number or numeric string to Indonesian Rupiah currency format.
 * Example: 65000 -> "Rp 65.000"
 */
export function formatRupiah(number) {
  const num = Number(number);
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Ensures colors is always a valid array of hex color strings.
 */
export function safeColors(colors) {
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

/**
 * Generates WhatsApp click-to-chat URL with predefined consultation message.
 */
export function getWhatsAppUrl(productName = '') {
  const phone = '628990809822';
  const message = productName
    ? `Halo Admin Kaos Dilio, saya tertarik dan ingin konsultasi/pesan produk: ${productName}. Apakah masih tersedia?`
    : `Halo Admin Kaos Dilio, saya ingin konsultasi pemesanan kaos polos / custom sablon.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
