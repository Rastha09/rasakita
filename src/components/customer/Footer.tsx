import { Link, useParams } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const basePath = `/${storeSlug || 'makka-bakerry'}`;

  return (
    <footer className="bg-muted border-t border-border px-4 py-8 text-sm text-muted-foreground">
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h3 className="text-base font-bold text-foreground mb-1">Makka Bakery</h3>
          <p className="text-xs leading-relaxed">
            Website resmi Makka Bakery untuk pemesanan produk roti dan support usaha rumahan.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Ds. Cempeh RT 002 RW 002, Kec. Lelea, Kab. Indramayu, Jawa Barat 45261</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0" />
            <a href="mailto:cs@rasakita.my.id" className="hover:text-foreground transition-colors">cs@rasakita.my.id</a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            <a href="https://wa.me/6208568821474" className="hover:text-foreground transition-colors">08568821474</a>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <Link to={`${basePath}/tentang-kami`} className="hover:text-foreground transition-colors">Tentang Kami</Link>
          <Link to={`${basePath}/kebijakan-privasi`} className="hover:text-foreground transition-colors">Kebijakan Privasi</Link>
          <Link to={`${basePath}/syarat-ketentuan`} className="hover:text-foreground transition-colors">Syarat & Ketentuan</Link>
        </div>

        <p className="text-xs text-muted-foreground/70 pt-2 border-t border-border">
          &copy; {new Date().getFullYear()} Makka Bakery. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
