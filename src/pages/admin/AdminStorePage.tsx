import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useAdminStore } from '@/hooks/useAdminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProductImageUrl } from '@/lib/product-image';
import { Loader2, Store, Upload, ImageIcon } from 'lucide-react';

export default function AdminStorePage() {
  const { store, isLoading, updateStore, uploadImage } = useAdminStore();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [themeColor, setThemeColor] = useState('#FF6B35');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (store) {
      setName(store.name);
      setAddress(store.address || '');
      setThemeColor(store.theme_color || '#FF6B35');
      if (store.logo_path) {
        setLogoPreview(getProductImageUrl(store.logo_path));
      }
      if (store.banner_path) {
        setBannerPreview(getProductImageUrl(store.banner_path));
      }
    }
  }, [store]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates: Record<string, unknown> = {
        name,
        address: address || null,
        theme_color: themeColor,
      };

      if (logoFile) {
        const logoPath = await uploadImage(logoFile, 'logo');
        updates.logo_path = logoPath;
      }

      if (bannerFile) {
        const bannerPath = await uploadImage(bannerFile, 'banner');
        updates.banner_path = bannerPath;
      }

      await updateStore.mutateAsync(updates);
    } finally {
      setIsSaving(false);
      setLogoFile(null);
      setBannerFile(null);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold">Informasi Toko</h1>
          <p className="text-sm text-muted-foreground">Kelola profil dan tampilan toko</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-4 w-4" />
                Profil Toko
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Toko</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama toko Anda"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat lengkap toko"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="themeColor">Warna Tema</Label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    id="themeColor"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="flex-1"
                    placeholder="#FF6B35"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo & Banner */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Logo & Banner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo Toko</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Rekomendasi: 200x200px, maks 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div className="space-y-2">
                <Label>Banner Toko</Label>
                <div 
                  className="w-full h-32 rounded-lg border bg-muted flex items-center justify-center overflow-hidden cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => document.getElementById('banner-upload')?.click()}
                >
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Klik untuk upload banner</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                  id="banner-upload"
                />
                <p className="text-xs text-muted-foreground">
                  Rekomendasi: 1200x400px, maks 5MB
                </p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Simpan Perubahan
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
