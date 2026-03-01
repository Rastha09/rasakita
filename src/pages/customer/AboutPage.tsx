import { CustomerLayout } from '@/components/layouts/CustomerLayout';

const AboutPage = () => (
  <CustomerLayout>
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground mb-4">Tentang Kami</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>
          <strong className="text-foreground">Makka Bakery</strong> adalah usaha rumahan yang bergerak di bidang 
          produksi dan penjualan roti berkualitas. Berlokasi di Ds. Cempeh RT 002 RW 002, Kec. Lelea, 
          Kab. Indramayu, Jawa Barat 45261.
        </p>
        <p>
          Kami berkomitmen menyediakan produk roti dengan bahan-bahan pilihan, proses pembuatan yang 
          higienis, dan harga yang terjangkau untuk masyarakat sekitar maupun pelanggan online.
        </p>
        <p>
          Website ini merupakan platform resmi Makka Bakery untuk memudahkan pelanggan dalam memesan 
          produk kami secara online.
        </p>
        <h2 className="text-lg font-semibold text-foreground pt-2">Kontak</h2>
        <ul className="list-none space-y-1 pl-0">
          <li>Email: cs@rasakita.my.id</li>
          <li>WhatsApp: 08568821474</li>
        </ul>
      </div>
    </div>
  </CustomerLayout>
);

export default AboutPage;
