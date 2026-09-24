/**
 * Formats a number to Indonesian Rupiah currency format.
 * Example: 65000 -> "Rp 65.000"
 */
export function formatRupiah(number) {
  if (typeof number !== 'number') return 'Rp 0';
  return 'Rp ' + number.toLocaleString('id-ID');
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
