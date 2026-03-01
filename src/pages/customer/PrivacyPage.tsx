import { CustomerLayout } from '@/components/layouts/CustomerLayout';

const PrivacyPage = () => (
  <CustomerLayout>
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground mb-4">Kebijakan Privasi</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>Terakhir diperbarui: Februari 2026</p>

        <h2 className="text-base font-semibold text-foreground">1. Informasi yang Kami Kumpulkan</h2>
        <p>
          Kami mengumpulkan informasi yang Anda berikan secara langsung saat mendaftar akun, melakukan 
          pemesanan, atau menghubungi kami. Informasi ini meliputi nama, alamat email, nomor telepon, 
          dan alamat pengiriman.
        </p>

        <h2 className="text-base font-semibold text-foreground">2. Penggunaan Informasi</h2>
        <p>Informasi yang kami kumpulkan digunakan untuk:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Memproses dan mengirimkan pesanan Anda</li>
          <li>Menghubungi Anda terkait pesanan</li>
          <li>Meningkatkan layanan kami</li>
        </ul>

        <h2 className="text-base font-semibold text-foreground">3. Keamanan Data</h2>
        <p>
          Kami melindungi data pribadi Anda dengan langkah-langkah keamanan yang wajar untuk mencegah 
          akses tidak sah, perubahan, atau penghapusan data.
        </p>

        <h2 className="text-base font-semibold text-foreground">4. Kontak</h2>
        <p>
          Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami di 
          cs@rasakita.my.id atau WhatsApp 08568821474.
        </p>
      </div>
    </div>
  </CustomerLayout>
);

export default PrivacyPage;
