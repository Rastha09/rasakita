import { CustomerLayout } from '@/components/layouts/CustomerLayout';

const TermsPage = () => (
  <CustomerLayout>
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground mb-4">Syarat & Ketentuan</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>Terakhir diperbarui: Februari 2026</p>

        <h2 className="text-base font-semibold text-foreground">1. Umum</h2>
        <p>
          Dengan menggunakan website Makka Bakery, Anda menyetujui syarat dan ketentuan berikut. 
          Jika tidak setuju, mohon untuk tidak menggunakan layanan kami.
        </p>

        <h2 className="text-base font-semibold text-foreground">2. Pemesanan</h2>
        <p>
          Pemesanan dilakukan melalui website ini. Pesanan yang sudah dikonfirmasi dan dibayar tidak 
          dapat dibatalkan kecuali atas persetujuan pihak Makka Bakery.
        </p>

        <h2 className="text-base font-semibold text-foreground">3. Pembayaran</h2>
        <p>
          Pembayaran dapat dilakukan melalui metode yang tersedia di website. Pesanan akan diproses 
          setelah pembayaran dikonfirmasi.
        </p>

        <h2 className="text-base font-semibold text-foreground">4. Pengiriman</h2>
        <p>
          Pengiriman dilakukan sesuai area jangkauan yang tersedia. Biaya pengiriman akan dihitung 
          berdasarkan lokasi tujuan.
        </p>

        <h2 className="text-base font-semibold text-foreground">5. Kontak</h2>
        <p>
          Untuk pertanyaan lebih lanjut, hubungi kami di cs@rasakita.my.id atau WhatsApp 08568821474.
        </p>
      </div>
    </div>
  </CustomerLayout>
);

export default TermsPage;
